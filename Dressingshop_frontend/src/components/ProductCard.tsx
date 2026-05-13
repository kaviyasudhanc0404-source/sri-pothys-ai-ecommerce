import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getFallbackProductImage, resolveProductImage } from "@/services/productImage";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const wishlisted = isInWishlist(product.id);
  const displayImage = resolveProductImage(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Login Required", {
        description: "Please login to add items to cart",
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }
    try {
      await addToCart(product);
      toast.success("Added to Cart", {
        description: `${product.name} has been added to your cart`,
      });
    } catch (error: any) {
      toast.error("Could not add to cart", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Login Required", {
        description: "Please login to add items to wishlist",
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group glass-card rounded-2xl overflow-hidden hover:shadow-gold transition-all duration-500 h-full flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = getFallbackProductImage(product);
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full gradient-gold text-[10px] font-bold uppercase tracking-wider text-maroon-dark">
              {product.badge}
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 rounded-full gradient-maroon text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-10 h-10 md:w-9 md:h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-destructive text-destructive" : "text-foreground"}`} />
        </button>

        {/* Hover Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-gold min-h-10 text-xs py-2 px-3 flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
            className="w-10 h-10 shrink-0 rounded-2xl bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <Link to={`/products/${product.id}`} className="block p-3.5 sm:p-4 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-display font-semibold text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-gold text-gold" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-bold text-sm sm:text-base">₹{product.price.toLocaleString()}</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
