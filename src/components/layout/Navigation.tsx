import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, User, Search, Home, Grid, X, Loader2 } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { cn } from "../../lib/utils";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserStore } from "../../store/useUserStore";
import axios from "axios";

// ─── Shared search state lifted so both desktop bar & mobile icon use it ──────
const useSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch when query >= 3 chars
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(query.trim())}`);
        setResults(res.data.slice(0, 10));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  // Escape key closes panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    close();
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const handleProductClick = (slug: string) => {
    close();
    navigate(`/product/${slug}`);
  };

  const showPanel = open && query.trim().length >= 3;

  return { query, setQuery, results, loading, open, setOpen, close, handleSubmit, handleProductClick, showPanel };
};

// ─── Centered Results Panel (fixed, independent scroll) ───────────────────────
const ResultsPanel = ({
  query,
  results,
  loading,
  showPanel,
  onProductClick,
  onViewAll,
  onClose,
}: {
  query: string;
  results: any[];
  loading: boolean;
  showPanel: boolean;
  onProductClick: (slug: string) => void;
  onViewAll: (e: React.FormEvent) => void;
  onClose: () => void;
}) => {
  if (!showPanel) return null;

  return (
    <>
      {/* Results panel — 50% wide, centered, no backdrop */}
      <div className="fixed z-[190] left-1/2 -translate-x-1/2 top-[80px] w-[50vw] max-w-[600px] min-w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[50vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {loading ? "Searching…" : results.length > 0 ? `${results.length} results for "${query}"` : `No results for "${query}"`}
          </p>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable results list */}
        <div className="overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              No products found for <span className="font-semibold text-slate-600">"{query}"</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {results.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => onProductClick(product.slug)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors group text-left focus:outline-none"
                >
                  {/* Left: image */}
                  <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group-hover:border-royal/30 transition-colors">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">No img</div>
                    )}
                  </div>

                  {/* Middle: name + description + category */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-royal transition-colors truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {product.description}
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-white bg-royal/80 rounded-full px-2 py-0.5">
                      {product.category}
                    </span>
                  </div>

                  {/* Right: price */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-royal">₹{product.price}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer: view all */}
        {results.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 shrink-0">
            <button
              onClick={onViewAll as any}
              className="w-full text-center text-sm text-royal font-semibold hover:underline"
            >
              View all results for "{query}" →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const itemCount = useCartStore((state) => state.getItemCount());
  const wishCount = useWishlistStore((state) => state.wishlist.length);
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const role = useUserStore((state) => state.role);

  const {
    query, setQuery, results, loading,
    open, setOpen, close,
    handleSubmit, handleProductClick, showPanel,
  } = useSearch();

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [searchNavActive, setSearchNavActive] = useState(false);

  const openSearchNav = () => {
    setSearchNavActive(true);
    setOpen(true);
    setTimeout(() => desktopInputRef.current?.focus(), 50);
  };

  const closeSearchNav = () => {
    setSearchNavActive(false);
    close();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-royal/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        {/*
          3-column grid on desktop:
            col 1 = logo (left)
            col 2 = nav links OR search bar (center)
            col 3 = icons (right)
        */}
        <div className="max-w-7xl mx-auto px-4 h-16 grid lg:grid-cols-[auto_1fr_auto] grid-cols-[1fr_1fr] items-center gap-6">

          {/* ── Col 1: Logo ─────────────────────────────── */}
          <Link to="/" className="flex flex-col shrink-0">
            <span className="font-serif text-2xl font-bold text-gold tracking-tight">Annaya</span>
            <span className="text-[10px] text-white tracking-[3px] -mt-1 uppercase">Boutique</span>
          </Link>

          {/* ── Col 2: Centered nav links (desktop) ─────── */}
          <div className="hidden lg:flex items-center justify-center">
            {!searchNavActive ? (
              /* Normal nav links */
              <div className="flex items-center gap-8 text-white/80 font-medium text-sm">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <Link to="/products" className="hover:text-gold transition-colors">Shop</Link>
                <button
                  type="button"
                  onClick={openSearchNav}
                  className="hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
                <Link to="/about" className="hover:text-gold transition-colors">About</Link>
                <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
              </div>
            ) : (
              /* Expanded search bar in place of nav links */
              <form
                onSubmit={(e) => { handleSubmit(e); setSearchNavActive(false); }}
                className="flex items-center w-full max-w-md bg-white/15 border border-white/30 rounded-full px-4 py-1.5 gap-2 focus-within:bg-white/20 focus-within:border-white/40 transition-all"
              >
                <Search className="w-4 h-4 text-white/60 shrink-0" />
                <input
                  ref={desktopInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  placeholder="Search by name, category or price…"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm outline-none min-w-0"
                />
                <button type="button" onClick={closeSearchNav} className="text-white/60 hover:text-white transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* ── Col 3: Icons (right) ─────────────────────── */}
          <div className="flex items-center justify-end gap-1">

            {/* Mobile search icon (hidden on desktop) */}
            <button
              type="button"
              onClick={() => { setOpen(!open); setTimeout(() => mobileInputRef.current?.focus(), 50); }}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/wishlist" className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-royal text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-royal text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated && role === "admin" && (
              <Link to="/admin" className="hidden sm:flex p-2 text-white hover:bg-white/10 rounded-full transition-colors items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase bg-gold text-royal px-2 py-1 rounded-md">Admin</span>
              </Link>
            )}

            {isAuthenticated ? (
              <Link to="/profile" className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full border border-white/20" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>
            ) : (
              <button onClick={() => loginWithRedirect()} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile: expandable search row shown below the main bar */}
        {open && (
          <div className="lg:hidden border-t border-white/10 px-4 py-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 focus-within:bg-white/20 transition-all">
              <Search className="w-4 h-4 text-white/60 shrink-0" />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm outline-none"
                autoFocus
              />
              {query && (
                <button type="button" onClick={close} className="text-white/60 hover:text-white shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        )}
      </nav>

      {/* Fixed centered results panel (both desktop & mobile) */}
      <ResultsPanel
        query={query}
        results={results}
        loading={loading}
        showPanel={showPanel}
        onProductClick={handleProductClick}
        onViewAll={handleSubmit}
        onClose={close}
      />
    </>
  );
};

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
export const MobileBottomNav = () => {
  const location = useLocation();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Grid, label: "Shop", path: "/products" },
    { icon: ShoppingBag, label: "Cart", path: "/cart", badge: itemCount },
    { icon: Heart, label: "Wishlist", path: "/wishlist" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-royal/98 backdrop-blur-lg border-t border-white/10 px-2 py-1 flex justify-around items-center safe-area-bottom">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={(e) => {
              if (item.label === "Profile" && !isAuthenticated) {
                e.preventDefault();
                loginWithRedirect();
              }
            }}
            className={cn(
              "flex flex-col items-center p-2 min-w-[64px] transition-colors",
              isActive ? "text-gold" : "text-white/60"
            )}
          >
            <div className="relative">
              <item.icon className="w-5 h-5 mb-1" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-royal text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
