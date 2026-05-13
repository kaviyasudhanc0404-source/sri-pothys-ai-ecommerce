import { createContext, useContext, useState, type ReactNode } from "react";
import { Product } from "@/data/products";

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: Product["id"]) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const getIdKey = (value: Product["id"]) => String(value);

  const toggleWishlist = (product: Product) => {
    const productKey = getIdKey(product.id);
    setItems((prev) => prev.some((i) => getIdKey(i.id) === productKey)
      ? prev.filter((i) => getIdKey(i.id) !== productKey)
      : [...prev, product]);
  };

  const isInWishlist = (productId: Product["id"]) => {
    const productKey = getIdKey(productId);
    return items.some((i) => getIdKey(i.id) === productKey);
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
