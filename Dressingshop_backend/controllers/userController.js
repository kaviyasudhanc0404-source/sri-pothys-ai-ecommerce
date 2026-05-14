import { User } from "../models/User.js";
import mongoose from "mongoose";

export const addAddress = async (req, res) => {
  try {
    const { name, address, city, state, pincode, phone, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    if (!name || !address || !city || !state || !pincode || !phone) {
      return res.status(400).json({ error: "All address fields are required" });
    }

    const newAddress = {
      id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      isDefault: isDefault || false,
    };

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add address" });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    res.json({
      addresses: user.addresses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, address, city, state, pincode, phone, isDefault } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    const addrIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId);

    if (addrIndex === -1) {
      return res.status(404).json({ error: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const existingAddress = user.addresses[addrIndex];
    if (name !== undefined) existingAddress.name = name.trim();
    if (address !== undefined) existingAddress.address = address.trim();
    if (city !== undefined) existingAddress.city = city.trim();
    if (state !== undefined) existingAddress.state = state.trim();
    if (pincode !== undefined) existingAddress.pincode = pincode.trim();
    if (phone !== undefined) existingAddress.phone = phone.trim();
    if (isDefault !== undefined) existingAddress.isDefault = isDefault;

    await user.save();

    res.json({
      message: "Address updated successfully",
      address: user.addresses[addrIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update address" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    const initialCount = user.addresses.length;

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);

    if (user.addresses.length === initialCount) {
      return res.status(404).json({ error: "Address not found" });
    }

    await user.save();

    res.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete address" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({
      message: "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    res.json({
      message: "Removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    res.json({
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, pushNotifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
          smsNotifications: smsNotifications !== undefined ? smsNotifications : undefined,
          pushNotifications: pushNotifications !== undefined ? pushNotifications : undefined,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("cart");

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    res.json({
      items: user.cart || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productKey, name, image, category, color, price, originalPrice, selectedSize, quantity = 1 } = req.body;

    if (!productKey || !name || !image || price === undefined) {
      return res.status(400).json({ error: "Product details are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    const existingIndex = user.cart.findIndex(
      (item) => item.productKey === productKey && item.selectedSize === selectedSize
    );

    if (existingIndex >= 0) {
      user.cart[existingIndex].quantity += Number(quantity);
    } else {
      user.cart.push({
        productKey,
        name,
        image,
        category,
        color,
        price,
        originalPrice,
        selectedSize,
        quantity: Number(quantity),
      });
    }

    await user.save();

    res.status(201).json({
      message: "Added to cart successfully",
      items: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, selectedSize } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    const item = user.cart.id(itemId);

    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (quantity !== undefined) {
      if (Number(quantity) <= 0) {
        item.deleteOne();
      } else {
        item.quantity = Number(quantity);
      }
    }

    if (selectedSize) {
      item.selectedSize = selectedSize;
    }

    await user.save();

    res.json({
      message: "Cart updated successfully",
      items: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    const item = user.cart.id(itemId);

    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    item.deleteOne();
    await user.save();

    res.json({
      message: "Removed from cart successfully",
      items: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    user.cart = [];
    await user.save();

    res.json({
      message: "Cart cleared successfully",
      items: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
