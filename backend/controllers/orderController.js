import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

//Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item",
      });
    }

    if (items.length > 50) {
      return res.status(400).json({
        message: "An order cannot contain more than 50 line items",
      });
    }

    // Validate and combine repeated product IDs so the same product cannot
    // bypass the stock check by being submitted on multiple lines.
    const quantitiesByProduct = new Map();

    for (const item of items) {
      if (!item || !mongoose.isValidObjectId(item.product)) {
        return res.status(400).json({
          message: "Each order item must contain a valid product ID",
        });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Product quantity must be a positive whole number",
        });
      }

      const productId = String(item.product);
      const combinedQuantity = (quantitiesByProduct.get(productId) || 0) + quantity;
      if (!Number.isSafeInteger(combinedQuantity)) {
        return res.status(400).json({ message: "Product quantity is too large" });
      }
      quantitiesByProduct.set(productId, combinedQuantity);
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of quantitiesByProduct.entries()) {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${productId}`,
        });
      }

      if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) {
        return res.status(400).json({
          message: `Product ${product.name} has an invalid price`,
        });
      }

      if (!Number.isInteger(Number(product.stock)) || product.stock < quantity) {
        return res.status(409).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = Number(product.price) * quantity;
      if (!Number.isFinite(itemTotal)) {
        return res.status(400).json({ message: "Order total is invalid" });
      }

      orderItems.push({
        product: product._id,
        quantity,
        // Always take the price from the database, never from the client.
        price: Number(product.price),
      });

      totalAmount += itemTotal;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: "Order total must be greater than zero" });
    }

    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount,
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      message: "Error creating order",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching order",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all orders",
      error: error.message,
    });
  }
};

//Update order status for administrators
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Do not allow an unpaid order to be shipped or delivered

    if (
      ["shipped", "delivered"].includes(status) &&
      order.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        message: "Order must be paid before it can be shipped or delivered",
      });
    }

    order.status = status;
    await order.save();
    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product");

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      paidOrders,
      pendingPayments,
      failedPayments,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      salesResult,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ paymentStatus: "pending" }),
      Order.countDocuments({ paymentStatus: "failed" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.aggregate([
        {
          $match: { paymentStatus: "paid" },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

    res.status(200).json({
      totalOrders,
      paidOrders,
      pendingPayments,
      failedPayments,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};
