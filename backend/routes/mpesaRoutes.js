import express from "express";

import {
  initiateStkPush,
  queryStkPushStatus,
} from "../services/mpesaService.js";

import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const normalizeKenyanPhoneNumber = (value) =>
  String(value ?? "").replace(/\D/g, "");

// Initiate an M-Pesa STK Push for an order owned by the logged-in user.
router.post("/stkpush", authMiddleware, async (req, res) => {
  try {
    // Do not accidentally send a real request while using the mock callback.
    if (process.env.MPESA_MOCK_MODE === "true") {
      return res.status(409).json({
        message:
          "STK Push is disabled while mock callback mode is enabled. Turn mock mode off to contact Daraja.",
      });
    }

    const { orderId, phoneNumber } = req.body ?? {};

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const normalizedPhoneNumber = normalizeKenyanPhoneNumber(phoneNumber);

    if (!/^254\d{9}$/.test(normalizedPhoneNumber)) {
      return res.status(400).json({
        message:
          "Enter a valid Kenyan phone number starting with 254, e.g. 254712345678.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure that users can pay only for their own orders.
    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to pay for this order",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order has already been paid" });
    }

    // Do not overwrite an active request ID while its callback may still arrive.
    if (order.paymentStatus === "pending" && order.checkoutRequestId) {
      return res.status(409).json({
        message:
          "A payment request is already pending for this order. Check the payment status before retrying.",
      });
    }

    if (!Number.isFinite(Number(order.totalAmount)) || order.totalAmount <= 0) {
      return res.status(400).json({ message: "Order amount is invalid" });
    }

    const callbackUrl = process.env.MPESA_CALLBACK_URL?.trim();

    if (!callbackUrl) {
      return res.status(500).json({
        message: "M-Pesa callback URL is not configured",
      });
    }

    let parsedCallbackUrl;
    try {
      parsedCallbackUrl = new URL(callbackUrl);
    } catch {
      return res.status(500).json({
        message: "M-Pesa callback URL is invalid",
      });
    }

    if (parsedCallbackUrl.protocol !== "https:") {
      return res.status(500).json({
        message: "M-Pesa callback URL must use HTTPS",
      });
    }

    const result = await initiateStkPush({
      phoneNumber: normalizedPhoneNumber,
      amount: order.totalAmount,
      accountReference: order._id.toString(),
      transactionDescription: "MERN E-commerce Order",
      callbackUrl,
    });

    // Only save request IDs when Daraja accepted the request.
    if (
      String(result.ResponseCode) !== "0" ||
      !result.MerchantRequestID ||
      !result.CheckoutRequestID
    ) {
      return res.status(502).json({
        message: "Daraja did not accept the STK Push request",
      });
    }

    order.merchantRequestId = result.MerchantRequestID;
    order.checkoutRequestId = result.CheckoutRequestID;
    order.mpesaPhoneNumber = normalizedPhoneNumber;
    order.paymentStatus = "pending";

    await order.save();

    console.log("M-Pesa details saved successfully to order:", {
      orderId: order._id.toString(),
      paymentStatus: order.paymentStatus,
      checkoutRequestId: order.checkoutRequestId,
    });

    return res.status(200).json({
      message: "STK Push initiated successfully",
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      data: result,
    });
  } catch (error) {
    console.error("STK Push route error:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

    return res.status(502).json({
      message: "Failed to initiate STK Push",
      error: error.response?.data || error.message,
    });
  }
});

// Safaricom Daraja sends STK Push results to this public callback URL.
router.post("/callback", async (req, res) => {
  try {
    // Mock callback mode is strictly for local development/Postman testing.
    // Normal Daraja callbacks do not contain the mock secret header.
    const mockMode = process.env.MPESA_MOCK_MODE === "true";

    if (mockMode && process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        message: "Mock mode is allowed only in development",
      });
    }

    if (mockMode) {
      const expectedSecret = process.env.MPESA_MOCK_SECRET;
      const suppliedSecret = req.get("x-mock-callback-secret");

      if (!expectedSecret || suppliedSecret !== expectedSecret) {
        return res.status(403).json({ message: "Invalid mock callback secret" });
      }
    }

    console.log("========== M-PESA CALLBACK ==========");
    console.log("Callback received at:", new Date().toISOString());

    const callbackData = req.body?.Body?.stkCallback;

    if (!callbackData) {
      console.error("Invalid M-Pesa callback structure");
      return res.status(200).json({
        message: "Callback received, but payload was invalid",
      });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callbackData;

    // Do not log the full callback; it can contain personal/payment data.
    console.log("Merchant Request ID:", MerchantRequestID);
    console.log("Checkout Request ID:", CheckoutRequestID);
    console.log("Result Code:", ResultCode);
    console.log("Result Description:", ResultDesc);

    if (
      !MerchantRequestID ||
      !CheckoutRequestID ||
      ResultCode === undefined ||
      ResultCode === null ||
      !Number.isFinite(Number(ResultCode))
    ) {
      console.error("Callback is missing required fields or has an invalid result");
      return res.status(200).json({
        message: "Callback is missing required fields",
      });
    }

    const order = await Order.findOne({
      checkoutRequestId: CheckoutRequestID,
    });

    if (!order) {
      console.error("Order not found for CheckoutRequestID:", CheckoutRequestID);
      return res.status(200).json({
        message: "Callback received, but order was not found",
      });
    }

    // Both request IDs must identify the exact STK request stored on the order.
    if (order.merchantRequestId !== MerchantRequestID) {
      console.error("MerchantRequestID does not match the saved order");
      return res.status(200).json({ message: "Callback request ID mismatch" });
    }

    if (order.paymentStatus === "paid") {
      console.log("Payment already completed for order:", order._id.toString());
      return res.status(200).json({ message: "Payment already processed" });
    }

    // A nonzero Daraja callback means the payment was not successful.
    if (Number(ResultCode) !== 0) {
      const failedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          merchantRequestId: MerchantRequestID,
          checkoutRequestId: CheckoutRequestID,
          paymentStatus: { $ne: "paid" },
        },
        { $set: { paymentStatus: "failed" } },
        { new: true, runValidators: true },
      );

      if (!failedOrder) {
        return res.status(200).json({ message: "Payment already processed" });
      }

      console.log("Payment failed for order:", failedOrder._id.toString());
      console.log("Result Code:", ResultCode);
      console.log("Reason:", ResultDesc);

      return res.status(200).json({
        message: "M-Pesa payment failure processed",
      });
    }

    // Independently verify success with Daraja, unless this is a protected
    // local mock callback used only to test the application flow.
    let verification;

    if (mockMode) {
      verification = {
        ResponseCode: "0",
        ResponseDescription: "Mock query accepted",
        MerchantRequestID,
        CheckoutRequestID,
        ResultCode: "0",
        ResultDesc: "Simulated successful transaction",
      };
      console.log("MOCK MODE: Simulating successful Daraja verification");
    } else {
      try {
        verification = await queryStkPushStatus(CheckoutRequestID);
      } catch (verificationError) {
        console.error(
          "Unable to verify transaction with Daraja:",
          verificationError.message,
        );

        return res.status(503).json({
          message:
            "Payment verification is temporarily unavailable. Order status was not changed.",
        });
      }
    }

    // A successful query request is not enough; require a final success result.
    if (String(verification?.ResponseCode) !== "0") {
      console.error(
        "Daraja STK Query request failed:",
        verification?.ResponseDescription,
      );
      return res.status(503).json({
        message: "Daraja could not verify the transaction",
      });
    }

    if (String(verification.ResultCode) === "4999") {
      console.log("Daraja still reports the transaction as processing");
      return res.status(200).json({
        message: "Transaction is still processing. Order status was not changed.",
      });
    }

    if (
      verification.CheckoutRequestID &&
      verification.CheckoutRequestID !== CheckoutRequestID
    ) {
      console.error("Daraja returned a different CheckoutRequestID");
      return res.status(200).json({
        message: "Transaction verification ID mismatch",
      });
    }

    if (
      verification.MerchantRequestID &&
      verification.MerchantRequestID !== order.merchantRequestId
    ) {
      console.error("Daraja returned a different MerchantRequestID");
      return res.status(200).json({
        message: "Transaction verification ID mismatch",
      });
    }

    if (
      verification.ResultCode === undefined ||
      verification.ResultCode === null ||
      verification.ResultCode === ""
    ) {
      console.error("Daraja query did not return a final transaction result");
      return res.status(503).json({
        message:
          "Transaction result is not yet available. Order status was not changed.",
      });
    }

    if (Number(verification.ResultCode) !== Number(ResultCode)) {
      console.error("Callback result does not match Daraja query");
      console.error("Callback ResultCode:", ResultCode);
      console.error("Daraja ResultCode:", verification.ResultCode);
      return res.status(200).json({
        message:
          "Callback and Daraja transaction results did not match. Order status was not changed.",
      });
    }

    // A success callback without the expected metadata must never mark paid.
    const items = CallbackMetadata?.Item;
    if (!Array.isArray(items)) {
      console.error("Successful callback has no valid metadata");
      return res.status(200).json({ message: "Missing payment metadata" });
    }

    const getMetadataValue = (name) =>
      items.find((item) => item.Name === name)?.Value;

    const amountValue = getMetadataValue("Amount");
    const receiptValue = getMetadataValue("MpesaReceiptNumber");
    const transactionDateValue = getMetadataValue("TransactionDate");
    const phoneNumberValue = getMetadataValue("PhoneNumber");

    const amount = Number(amountValue);
    const expectedAmount = Math.round(Number(order.totalAmount));
    const receiptNumber = receiptValue == null ? "" : String(receiptValue).trim();
    const transactionDate =
      transactionDateValue == null ? "" : String(transactionDateValue).trim();
    const callbackPhoneNumber = normalizeKenyanPhoneNumber(phoneNumberValue);
    const expectedPhoneNumber = normalizeKenyanPhoneNumber(
      order.mpesaPhoneNumber,
    );

    if (
      amountValue == null ||
      !Number.isFinite(amount) ||
      amount !== expectedAmount
    ) {
      console.error("Payment amount mismatch", {
        expected: expectedAmount,
        received: amountValue,
      });
      return res.status(200).json({
        message: "Payment amount did not match the order",
      });
    }

    if (
      !/^254\d{9}$/.test(expectedPhoneNumber) ||
      callbackPhoneNumber !== expectedPhoneNumber
    ) {
      console.error("Payment phone number did not match the order");
      return res.status(200).json({
        message: "Payment phone number did not match the order",
      });
    }

    if (!receiptNumber) {
      console.error("M-Pesa receipt number is missing");
      return res.status(200).json({ message: "Missing M-Pesa receipt number" });
    }

    if (!/^\d{14}$/.test(transactionDate)) {
      console.error("Invalid M-Pesa transaction date");
      return res.status(200).json({ message: "Invalid transaction date" });
    }

    // Atomic conditional update prevents a duplicate callback from overwriting
    // an order that another callback has already marked as paid.
    const paidOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        merchantRequestId: MerchantRequestID,
        checkoutRequestId: CheckoutRequestID,
        paymentStatus: { $ne: "paid" },
      },
      {
        $set: {
          paymentStatus: "paid",
          status: "processing",
          mpesaReceiptNumber: receiptNumber,
          transactionDate,
          paidAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!paidOrder) {
      return res.status(200).json({ message: "Payment already processed" });
    }

    console.log("========== PAYMENT SUCCESS ==========");
    console.log("Order ID:", paidOrder._id.toString());
    console.log("Payment status:", paidOrder.paymentStatus);
    console.log("Order status:", paidOrder.status);
    console.log("M-Pesa receipt:", paidOrder.mpesaReceiptNumber);
    console.log("Transaction date:", paidOrder.transactionDate);
    console.log("Paid at:", paidOrder.paidAt);
    console.log("=====================================");

    return res.status(200).json({
      message: "M-Pesa payment processed successfully",
    });
  } catch (error) {
    console.error("M-Pesa callback processing error:", error.message);

    // A server error makes it visible that processing failed. Monitor pending
    // orders and reconcile them if callback processing fails after a real payment.
    return res.status(503).json({
      message: "Callback processing failed; payment status was not confirmed",
    });
  }
});

export default router;
