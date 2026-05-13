import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, User, Sun, Moon, LogOut, Lock, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/ai-stylist", label: "AI Stylist" },
  { to: "/orders", label: "Orders" },
  { to: "/profile", label: "Profile" },
];

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname !== "/products") return;
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMobileNavOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  const handleAdminAccess = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
    setUserMenuOpen(false);
  };

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = searchQuery.trim();
    const target = trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products";
    navigate(target);
    setSearchOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card-strong border-b border-border/50">
        <div className="gradient-festive text-primary-foreground text-center px-3 py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide sm:tracking-wider">
          <span className="block truncate sm:hidden">GRAND FESTIVAL SALE - UP TO 60% OFF</span>
          <span className="hidden sm:block">GRAND FESTIVAL SALE - Up to 60% Off on Wedding Collection</span>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <div className="w-9 h-9 shrink-0 rounded-full gradient-gold flex items-center justify-center text-sm font-bold text-maroon-dark">SP</div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-sm font-display font-bold leading-tight text-foreground">SRI POTHYS</h1>
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Silks & Readymades</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to={isAuthenticated ? "/wishlist" : "/login"}
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
              title={isAuthenticated ? "Wishlist" : "Login to view wishlist"}
            >
              <Heart className="w-4 h-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-gold text-[10px] font-bold flex items-center justify-center text-maroon-dark">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-maroon text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="relative hidden md:block" ref={userMenuRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  title={`${user?.firstName} ${user?.lastName}`}
                >
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-maroon-dark">
                    {user?.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                </button>
              ) : (
                <Link to="/login" className="p-2 rounded-full hover:bg-muted transition-colors" title="Login">
                  <User className="w-4 h-4" />
                </Link>
              )}

              <AnimatePresence>
                {isAuthenticated && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="px-4 py-4 border-b border-border bg-muted">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                      {user?.role === "admin" && (
                        <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full gradient-gold text-maroon-dark text-[10px] font-bold">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="py-2 bg-card">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        My Profile
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        My Wishlist
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        My Orders
                      </Link>

                      {user?.role === "admin" && (
                        <button
                          onClick={handleAdminAccess}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary/10 transition-colors border-t border-border mt-1"
                        >
                          <Lock className="w-4 h-4" />
                          Admin Dashboard
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-destructive font-medium hover:bg-destructive/10 transition-colors border-t border-border mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="p-2 rounded-full hover:bg-muted transition-colors md:hidden"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-3"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-2">
                <button type="submit" className="text-muted-foreground" aria-label="Submit search">
                  <Search className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Search for sarees, lehengas, kurtas..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  autoFocus
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </nav>

      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-foreground/45 backdrop-blur-sm md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed inset-y-0 right-0 z-[90] flex min-h-[100svh] w-[86vw] max-w-[330px] flex-col bg-card text-foreground border-l border-border shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-maroon-dark">SP</div>
                  <div className="min-w-0">
                    <p className="text-base font-display font-bold leading-tight truncate">SRI POTHYS</p>
                    <p className="text-xs text-muted-foreground truncate">Silks & Readymades</p>
                  </div>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="p-2 rounded-full hover:bg-muted shrink-0" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex min-h-12 items-center rounded-2xl px-4 text-base font-medium transition-colors ${
                        location.pathname === link.to ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-4 space-y-2">
                  {isAuthenticated ? (
                    <Link
                      to="/profile"
                      className="flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm text-foreground hover:bg-muted"
                    >
                      <User className="w-4 h-4 shrink-0" /> My Profile
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm text-foreground hover:bg-muted"
                    >
                      <User className="w-4 h-4 shrink-0" /> Login
                    </Link>
                  )}

                  {isAuthenticated && user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm text-foreground hover:bg-muted"
                    >
                      <Lock className="w-4 h-4 shrink-0" /> Admin Dashboard
                    </Link>
                  )}

                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleLogout();
                      }}
                      className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 shrink-0" /> Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
