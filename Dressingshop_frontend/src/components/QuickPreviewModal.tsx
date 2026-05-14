import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, ShoppingBag, Star, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getFallbackProductImage, resolveProductImage } from "@/services/productImage";
import { getErrorMessage } from "@/lib/utils";

interface QuickPreviewModalProps {
  product: Product | null;
  onClose: () => void;
}

const QuickPreviewModal = ({ product, onClose }: QuickPreviewModalProps) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!product) return null;

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Login Required", {
        description: "Please login to add items to cart",
        action: {
          label: "Login",
          onClick: () => { onClose(); navigate("/login"); },
        },
      });
      return;
    }
    try {
      await addToCart(product);
      toast.success("Added to Cart", {
        description: `${product.name} has been added to your cart`,
      });
      onClose();
    } catch (error) {
      toast.error("Could not add to cart", {
        description: getErrorMessage(error) || "Please try again.",
      });
    }
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Login Required", {
        description: "Please login to add items to wishlist",
        action: {
          label: "Login",
          onClick: () => { onClose(); navigate("/login"); },
        },
      });
      return;
    }
    toggleWishlist(product);
    toast.success(wishlisted ? "Removed from Wishlist" : "Added to Wishlist", {
      description: wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-strong rounded-3xl overflow-hidden max-w-2xl w-full max-h-[92svh] sm:max-h-[85vh] overflow-y-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[4/3] md:aspect-[3/4]">
            <img
              src={resolveProductImage(product)}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getFallbackProductImage(product);
              }}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full gradient-gold text-xs font-bold text-maroon-dark">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-4 sm:p-6 flex flex-col">
            <button onClick={onClose} className="self-end p-2 rounded-full hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>

            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{product.category}</p>
            <h2 className="font-display text-xl font-bold mb-2">{product.name}</h2>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
              <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
              <span className="text-xs font-bold text-destructive">-{discount}%</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{product.description}</p>

            {/* Sizes */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.size.map((s) => (
                  <button key={s} className="px-3 py-1.5 text-xs rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-gold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors ${
                  wishlisted ? "bg-destructive/10 border-destructive/30" : "border-border hover:bg-muted"
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuickPreviewModal;
