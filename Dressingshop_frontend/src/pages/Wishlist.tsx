import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";

const Wishlist = () => {
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen">
      <div className="gradient-maroon py-10">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">My Wishlist</h1>
          <p className="text-primary-foreground/60 text-sm mt-1">Products you saved with the heart icon</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
            <p className="text-sm text-muted-foreground mb-6">Save items you love by tapping the heart icon.</p>
            <Link to="/products" className="btn-gold">Browse Collection</Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlistItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
