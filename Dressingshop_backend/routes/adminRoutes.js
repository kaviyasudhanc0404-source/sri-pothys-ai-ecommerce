import express from "express";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";
import {
  getAnalyticsData,
  getDashboardData,
  getUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, authorizeAdmin, getDashboardData);
router.get("/users", authenticateToken, authorizeAdmin, getUsers);
router.put("/users/:id", authenticateToken, authorizeAdmin, updateUserByAdmin);
router.delete("/users/:id", authenticateToken, authorizeAdmin, deleteUserByAdmin);
router.get("/analytics", authenticateToken, authorizeAdmin, getAnalyticsData);

export default router;
