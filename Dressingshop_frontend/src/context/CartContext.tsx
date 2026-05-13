import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Product } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";

export interface CartItem {
  id: string;
  productKey: string;
  name: string;
  image: string;
  category: string;
  color: string;
  price: number;
  originalPrice: number;
  quantity: number;
  selectedSize: string;
  product?: Product;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  reloadCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

interface CartApiItem {
  _id: string;
  productKey: string;
  name: string;
  image: string;
  category?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  selectedSize?: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapProductToCartPayload = (product: Product, size?: string, quantity = 1) => ({
  productKey: String(product.id),
  name: product.name,
  image: product.image,
  category: product.category,
  color: product.color,
  price: product.price,
  originalPrice: product.originalPrice,
  selectedSize: size || product.size[0],
  quantity,
});

const mapCartItem = (item: CartApiItem): CartItem => ({
  id: item._id,
  productKey: item.productKey,
  name: item.name,
  image: item.image,
  category: item.category || "Fashion",
  color: item.color || "Default",
  price: item.price,
  originalPrice: item.originalPrice || item.price,
  quantity: item.quantity,
  selectedSize: item.selectedSize || "Free Size",
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reloadCart = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest<{ items: CartApiItem[] }>("/users/cart", {
        method: "GET",
        token,
      });
      setItems((data?.items ?? []).map(mapCartItem));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    reloadCart().catch(() => {
      setItems([]);
      setIsLoading(false);
    });
  }, [reloadCart]);

  const addToCart = useCallback(async (product: Product, size?: string, quantity = 1) => {
    if (!token) {
      throw new Error("Please login to continue");
    }

    const data = await apiRequest<{ items: CartApiItem[] }>("/users/cart", {
      method: "POST",
      token,
      body: JSON.stringify(mapProductToCartPayload(product, size, quantity)),
    });
    setItems((data?.items ?? []).map(mapCartItem));
  }, [token]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!token) {
      throw new Error("Please login to continue");
    }

    const data = await apiRequest<{ items: CartApiItem[] }>(`/users/cart/${itemId}`, {
      method: "DELETE",
      token,
    });
    setItems((data?.items ?? []).map(mapCartItem));
  }, [token]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!token) {
      throw new Error("Please login to continue");
    }

    const data = await apiRequest<{ items: CartApiItem[] }>(`/users/cart/${itemId}`, {
      method: "PUT",
      token,
      body: JSON.stringify({ quantity }),
    });
    setItems((data?.items ?? []).map(mapCartItem));
  }, [token]);

  const clearCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }

    const data = await apiRequest<{ items: CartApiItem[] }>("/users/cart", {
      method: "DELETE",
      token,
    });
    setItems((data?.items ?? []).map(mapCartItem));
  }, [token]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, reloadCart, totalItems, totalPrice, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};
