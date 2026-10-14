import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import {
  createOrder,
  initiateMpesaPayment,
  getOrderById,
} from "../services/orderService";

const Cart = () => {
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidOrder, setPaidOrder] = useState(null);

  const { user } = useAuth();

  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
      };

      const data = await createOrder(orderData);

      console.log("Order created:", data);
      console.log("Order object:", data.order);
      console.log("Order JSON:", JSON.stringify(data.order, null, 2));
      console.log("Order keys:", Object.keys(data.order || {}));

      const createdOrderId = data.order?._id || data.order?.id;

      console.log("Created Order ID:", createdOrderId);

      setOrderId(createdOrderId);

      setPaymentMessage(
        "Order created successfully. Enter your M-Pesa number to continue.",
      );
    } catch (error) {
      console.error("Checkout failed:", error);

      setPaymentMessage(
        error.response?.data?.message || "Failed to place order",
      );
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;

    const checkStatus = async () => {
      try {
        attempts++;

        const order = await getOrderById(orderId);

        console.log("Payment status:", order.paymentStatus);

        if (order.paymentStatus === "paid") {
          // Clear the cart only after payment is confirmed.
          clearCart();

          // Save the paid order so it can be displayed
          // after the cart becomes empty.
          setPaidOrder(order);

          setPaymentSuccess(true);
          setPaymentMessage("Payment successful!");

          return;
        }

        if (order.paymentStatus === "failed") {
          setPaymentMessage("M-Pesa payment failed. Please try again.");

          return;
        }

        if (attempts >= maxAttempts) {
          setPaymentMessage(
            "Payment is still pending. Please check your Orders page.",
          );

          return;
        }

        setTimeout(checkStatus, 3000);
      } catch (error) {
        console.error("Payment status check failed:", error);

        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        } else {
          setPaymentMessage(
            "Unable to confirm payment status. Please check your Orders page.",
          );
        }
      }
    };

    checkStatus();
  };

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      setPaymentMessage("Please enter your M-Pesa phone number.");
      return;
    }

    if (!orderId) {
      setPaymentMessage("Order ID is missing.");
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentMessage("");

      const data = await initiateMpesaPayment(orderId, phoneNumber);

      console.log("STK Push response:", data);

      setPaymentMessage(
        "M-Pesa payment request sent. Check your phone and enter your M-Pesa PIN.",
      );

      checkPaymentStatus();
    } catch (error) {
      console.error("M-Pesa payment failed:", error);

      setPaymentMessage(
        error.response?.data?.message || "Failed to initiate M-Pesa payment.",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /*
   * Show the empty-cart page only when there is no cart
   * and there is NOT a successful payment being displayed.
   *
   * This is important because clearCart() empties the cart
   * after payment. We still want to show the success screen.
   */
  if (cartItems.length === 0 && !paymentSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>

        <p className="text-gray-600 mb-6">
          Add some products to your cart to get started.
        </p>

        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {paymentSuccess ? "Order Confirmation" : "Shopping Cart"}
      </h1>

      {/* Successful payment */}
      {paymentSuccess ? (
        <div className="max-w-2xl mx-auto">
          <div className="border border-green-300 bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-green-700">
              Payment Successful
            </h2>

            <p className="text-gray-600 mt-2">
              Your M-Pesa payment has been confirmed.
            </p>

            {paidOrder && (
              <div className="mt-6 border-t border-green-200 pt-5 space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Order ID:</span>

                  <span className="font-medium text-right break-all">
                    {paidOrder._id}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>

                  <span className="font-semibold">
                    KSh {paidOrder.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Order Status:</span>

                  <span className="font-medium capitalize">
                    {paidOrder.status}
                  </span>
                </div>

                {paidOrder.paymentStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>

                    <span className="font-medium text-green-700 capitalize">
                      {paidOrder.paymentStatus}
                    </span>
                  </div>
                )}

                {paidOrder.mpesaReceiptNumber && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">M-Pesa Receipt:</span>

                    <span className="font-medium">
                      {paidOrder.mpesaReceiptNumber}
                    </span>
                  </div>
                )}

                {paidOrder.transactionDate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Transaction Date:</span>

                    <span className="font-medium">
                      {paidOrder.transactionDate}
                    </span>
                  </div>
                )}

                {paidOrder.paidAt && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Paid At:</span>

                    <span className="font-medium">
                      {new Date(paidOrder.paidAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate("/orders")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                View My Orders
              </button>

              <button
                onClick={() => navigate("/products")}
                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-6 border rounded-lg p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.name}</h2>

                  <p className="text-gray-600">
                    KSh {item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(item._id, Math.max(1, item.quantity - 1))
                    }
                    className="px-3 py-1 border rounded"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-1 border rounded"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Cart total and checkout */}
          <div className="mt-10 border-t pt-6 flex justify-end">
            <div className="text-right">
              <p className="text-gray-600">Total</p>

              <p className="text-3xl font-bold mb-4">
                KSh {getCartTotal().toLocaleString()}
              </p>

              {!orderId ? (
                <button
                  onClick={handleCheckout}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="mt-4 w-full max-w-sm text-left">
                  <h2 className="text-lg font-semibold mb-3">
                    Pay with M-Pesa
                  </h2>

                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                    className="w-full border rounded-lg px-4 py-3 mb-3"
                  />

                  <button
                    onClick={handleMpesaPayment}
                    disabled={paymentLoading}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {paymentLoading
                      ? "Sending Payment Request..."
                      : "Pay with M-Pesa"}
                  </button>

                  {paymentMessage && (
                    <p className="mt-3 text-sm text-gray-600">
                      {paymentMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
