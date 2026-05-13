import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
} from "../controllers/productController.js";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", authenticateToken, addProductReview);

// Admin routes
router.post("/", authenticateToken, authorizeAdmin, createProduct);
router.put("/:id", authenticateToken, authorizeAdmin, updateProduct);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteProduct);

export default router;
