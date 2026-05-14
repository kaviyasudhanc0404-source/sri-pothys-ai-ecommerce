import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Heart, ShoppingBag, Minus, Plus, ChevronRight, Truck, RotateCcw, Shield, Zap } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { fetchProductById, submitProductReview } from "@/services/productCatalog";
import { getFallbackProductImage, resolveProductImage } from "@/services/productImage";
import { getErrorMessage } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const localProduct = useMemo(() => products.find((p) => String(p.id) === id), [id]);
  const [product, setProduct] = useState(localProduct || null);
  const [loading, setLoading] = useState(!localProduct);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, token, user } = useAuth();
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const isMongoId = (value: string) => /^[a-f\d]{24}$/i.test(value);

    const loadProduct = async () => {
      setSelectedSize("");
      setQty(1);

      if (!id) {
        setProduct(null);
        setLoading(false);
        return;
      }

      if (localProduct) {
        setProduct(localProduct);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        if (isMongoId(id)) {
          const liveProduct = await fetchProductById(id);
          if (!cancelled) setProduct(liveProduct);
        }
      } catch (error) {
        if (!cancelled && !localProduct) {
          setProduct(null);
          toast.error("Could not load product", {
            description: getErrorMessage(error) || "Please go back to the collection and try again.",
          });
        }
      } finally {
        if (!cancelled && !localProduct) setLoading(false);
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, localProduct]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
          <h2 className="font-display text-2xl font-bold">Loading Product</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">:(</p>
          <h2 className="font-display text-2xl font-bold mb-2">Product Not Found</h2>
          <Link to="/products" className="btn-gold text-sm mt-4 inline-block">Browse Collection</Link>
        </div>
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const similar = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const wishlisted = isInWishlist(product.id);
  const finalSize = selectedSize || product.size[0];
  const productImage = resolveProductImage(product);
  const reviewEntries = product.reviewEntries || [];

  const ensureAuthenticated = (message: string) => {
    if (isAuthenticated) return true;

    toast.error("Login Required", {
      description: message,
      action: {
        label: "Login",
        onClick: () => navigate("/login"),
      },
    });
    return false;
  };

  const handleAddToCart = async () => {
    if (!ensureAuthenticated("Please login to add items to cart")) return;

    try {
      await addToCart(product, finalSize, qty);
      toast.success("Added to Cart", {
        description: `${qty} x ${product.name} added to your cart`,
      });
    } catch (error) {
      toast.error("Could not add to cart", {
        description: getErrorMessage(error) || "Please try again.",
      });
    }
  };

  const handleBuyNow = () => {
    if (!ensureAuthenticated("Please login to continue with your purchase")) return;

    navigate("/checkout", {
      state: {
        buyNowItem: {
          productKey: String(product.id),
          name: product.name,
          image: product.image,
          category: product.category,
          color: product.color,
          price: product.price,
          originalPrice: product.originalPrice,
          selectedSize: finalSize,
          quantity: qty,
        },
      },
    });
  };

  const handleToggleWishlist = () => {
    if (!ensureAuthenticated("Please login to add items to wishlist")) return;

    toggleWishlist(product);
    toast.success(wishlisted ? "Removed from Wishlist" : "Added to Wishlist", {
      description: wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`,
    });
  };

  const handleSubmitReview = async () => {
    if (!ensureAuthenticated("Please login to submit a review")) return;

    const trimmedComment = reviewComment.trim();
    if (!trimmedComment) {
      toast.error("Review required", {
        description: "Please share a short review before submitting.",
      });
      return;
    }

    if (!token) return;

    const productId = String(product.id);
    const isMongoId = /^[a-f\d]{24}$/i.test(productId);
    if (!isMongoId) {
      toast.error("Reviews unavailable", {
        description: "This item is a demo product. Reviews are available on live products only.",
      });
      return;
    }

    setReviewSubmitting(true);
    try {
      const updatedProduct = await submitProductReview(
        productId,
        { rating: reviewRating, comment: trimmedComment },
        token
      );

      setProduct(updatedProduct);
      setReviewComment("");
      setReviewRating(5);
      toast.success("Review submitted", {
        description: "Thanks for sharing your feedback.",
      });
    } catch (error) {
      toast.error("Could not submit review", {
        description: getErrorMessage(error) || "Please try again.",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] mb-4 shadow-lg">
              <img
                src={productImage}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = getFallbackProductImage(product);
                }}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full gradient-gold text-xs font-bold text-maroon-dark">{product.badge}</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square min-w-0 rounded-xl overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-colors">
                  <img
                    src={productImage}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getFallbackProductImage(product);
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{product.category} • {product.occasion}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-gold text-gold" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-6">
              <span className="text-2xl sm:text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
              <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">Save {discount}%</span>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Select Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-2xl text-sm border-2 transition-all ${
                      finalSize === size ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Quantity</h3>
              <div className="inline-flex items-center gap-3 border border-border rounded-2xl px-2 py-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-6">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleBuyNow} className="btn-maroon text-base flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" /> Buy Now
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="btn-gold text-base flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </motion.button>
              <button
                onClick={handleToggleWishlist}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  wishlisted ? "border-destructive bg-destructive/10" : "border-border hover:border-primary/50"
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 mb-6">
              {[
                { icon: Truck, label: "Free Delivery" },
                { icon: RotateCcw, label: "7-Day Return" },
                { icon: Shield, label: "Genuine Product" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="w-4 h-4 text-gold" /> {label}
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex gap-6 mb-4 overflow-x-auto scrollbar-hide">
                {["description", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-semibold capitalize transition-colors pb-2 ${
                      activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === "description" ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description} This piece showcases the rich heritage of Indian craftsmanship with meticulous attention to detail. Perfect for making a statement at any occasion.
                </p>
              ) : (
                <div className="space-y-6">
                  {reviewEntries.length ? (
                    <div className="space-y-4">
                      {reviewEntries.map((review) => (
                        <div key={review.id} className="p-4 bg-muted/50 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold">{review.name}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-gold text-gold" : "text-muted"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your feedback.</p>
                  )}

                  <div className="border-t border-border pt-5">
                    <h3 className="text-sm font-semibold mb-3">Write a Review</h3>
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setReviewRating(s)}
                              className="focus:outline-none"
                              aria-label={`Rate ${s} star${s === 1 ? "" : "s"}`}
                            >
                              <Star className={`w-5 h-5 ${s <= reviewRating ? "fill-gold text-gold" : "text-muted"}`} />
                            </button>
                          ))}
                          <span className="text-xs text-muted-foreground">{reviewRating} / 5</span>
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(event) => setReviewComment(event.target.value)}
                          rows={3}
                          placeholder={`Share your experience${user?.firstName ? `, ${user.firstName}` : ""}...`}
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                        <button
                          onClick={handleSubmitReview}
                          disabled={reviewSubmitting}
                          className="btn-gold text-sm disabled:opacity-70"
                        >
                          {reviewSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Login to submit your review.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible">
              {similar.map((item) => (
                <div key={item.id} className="shrink-0 min-w-[76vw] max-w-[76vw] min-[420px]:min-w-[260px] min-[420px]:max-w-[260px] sm:shrink sm:min-w-0 sm:max-w-none">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
