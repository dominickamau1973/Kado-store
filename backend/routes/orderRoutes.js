import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminDashboardStats,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Customer routes
router.post("/", authMiddleware, createOrder);

router.get("/my-orders", authMiddleware, getMyOrders);

//Admin routes
router.get(
  "/admin/stats",
  authMiddleware,
  adminMiddleware,
  getAdminDashboardStats,
);

router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrders);

router.patch(
  "/admin/:orderId/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus,
);

//Customer single order route

router.get("/:orderId", authMiddleware, getOrderById);

export default router;
