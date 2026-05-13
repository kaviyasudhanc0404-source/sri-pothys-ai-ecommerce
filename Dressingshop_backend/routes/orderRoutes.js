import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/", authenticateToken, createOrder);
router.get("/user/orders", authenticateToken, getOrders);
router.get("/:id", authenticateToken, getOrderById);

// Admin routes
router.put("/:id/status", authenticateToken, authorizeAdmin, updateOrderStatus);
router.get("/", authenticateToken, authorizeAdmin, getAllOrders);

export default router;
