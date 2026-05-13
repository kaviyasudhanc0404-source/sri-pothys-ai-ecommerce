import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  updatePreferences,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Address routes
router.post("/addresses", authenticateToken, addAddress);
router.get("/addresses", authenticateToken, getAddresses);
router.put("/addresses/:addressId", authenticateToken, updateAddress);
router.delete("/addresses/:addressId", authenticateToken, deleteAddress);

// Wishlist routes
router.post("/wishlist", authenticateToken, addToWishlist);
router.delete("/wishlist", authenticateToken, removeFromWishlist);
router.get("/wishlist", authenticateToken, getWishlist);

// Preferences routes
router.put("/preferences", authenticateToken, updatePreferences);

// Cart routes
router.get("/cart", authenticateToken, getCart);
router.post("/cart", authenticateToken, addToCart);
router.put("/cart/:itemId", authenticateToken, updateCartItem);
router.delete("/cart/:itemId", authenticateToken, removeFromCart);
router.delete("/cart", authenticateToken, clearCart);

export default router;
