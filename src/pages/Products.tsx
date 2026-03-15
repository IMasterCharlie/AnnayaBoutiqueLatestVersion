import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { Filter, X, Search } from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { ProductCard } from "../components/products/ProductCard";
import { cn } from "../lib/utils";

const FROCK_PRIORITY_IDS = [
  "69a35e8643e117e303520c39",
  "69a35ca343e117e303520c26",
  "69a35c7c43e117e303520c22",
  "69a35c5a43e117e303520c1e"
];

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: categoryParam } = useParams<{ category?: string }>();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Local search input state (for the inline search bar)
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");

  // useParams doesn't automatically decode '+' into spaces like searchParams does
  const category = categoryParam?.replace(/\+/g, " ") || searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "default";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Keep local search input in sync if URL changes externally (e.g. navbar search)
  useEffect(() => {
    setLocalSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== "All") params.set("category", category);
        if (sort && sort !== "default") params.set("sort", sort);
        if (search) params.set("search", search);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        const res = await api.get(`/api/products?${params.toString()}`);
        let fetchedProducts = res.data;

        // Apply priority sorting for "Frock" category
        const isFrockCategory = category && ["frock", "frocks"].includes(category.toLowerCase());
        
        if (isFrockCategory) {
          const priorityItems = [];
          const otherItems = [];

          // Separate priority products from others
          fetchedProducts.forEach((p: any) => {
            // Handle both string IDs and MongoDB ObjectIDs (if they come as objects with $oid)
            const id = p._id && typeof p._id === 'object' && p._id.$oid ? p._id.$oid : p._id;
            
            if (FROCK_PRIORITY_IDS.includes(id)) {
              priorityItems.push(p);
            } else {
              otherItems.push(p);
            }
          });

          // Sort priority items based on the order in FROCK_PRIORITY_IDS
          priorityItems.sort((a, b) => {
            const idA = a._id && typeof a._id === 'object' && a._id.$oid ? a._id.$oid : a._id;
            const idB = b._id && typeof b._id === 'object' && b._id.$oid ? b._id.$oid : b._id;
            return FROCK_PRIORITY_IDS.indexOf(idA) - FROCK_PRIORITY_IDS.indexOf(idB);
          });

          fetchedProducts = [...priorityItems, ...otherItems];
        }

        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, sort, search, minPrice, maxPrice]);

  const categories = ["All", "Lehenga", "Saree", "Kurti", "Suit", "Frock", "Kids Wear", "Co-ord Set", "Ready to Wear", "Special"];

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("search", localSearch.trim());
  };

  const clearSearch = () => {
    setLocalSearch("");
    setParam("search", "");
  };

  const clearPriceRange = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("minPrice");
    next.delete("maxPrice");
    setSearchParams(next);
  };

  const applyPriceRange = (min: string, max: string) => {
    const next = new URLSearchParams(searchParams);
    if (min) next.set("minPrice", min); else next.delete("minPrice");
    if (max) next.set("maxPrice", max); else next.delete("maxPrice");
    setSearchParams(next);
    setShowFilters(false);
  };

  // Active filter chip helpers
  const hasActiveSearch = !!search;
  const hasActivePriceRange = !!minPrice || !!maxPrice;

  const pageTitle = search
    ? `Results for "${search}"`
    : category === "All"
    ? "Our Collection"
    : category + "s";

  return (
    <div className="pb-20 lg:pb-10 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-royal mb-1">{pageTitle}</h1>
            <p className="text-slate-500 text-sm">{products.length} exquisite pieces found</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full text-sm font-bold text-slate-700"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="px-4 py-2 bg-white border border-slate-100 rounded-full text-sm font-bold text-slate-700 outline-none focus:border-royal transition-colors"
            >
              <option value="default">Featured</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>




        {/* Active filter chips */}
        {(hasActiveSearch || hasActivePriceRange || category !== "All") && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hasActiveSearch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-royal/10 text-royal rounded-full text-xs font-semibold">
                Search: "{search}"
                <button onClick={clearSearch}><X className="w-3 h-3" /></button>
              </span>
            )}
            {category !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/20 text-amber-800 rounded-full text-xs font-semibold">
                {category}
                <button onClick={() => setParam("category", "")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {hasActivePriceRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                ₹{minPrice || "0"} – ₹{maxPrice || "∞"}
                <button onClick={clearPriceRange}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Categories</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setParam("category", cat === "All" ? "" : cat)}
                    className={cn(
                      "block w-full text-left text-sm silk-transition hover:translate-x-1",
                      category === cat ? "text-royal font-bold" : "text-slate-500"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <PriceRangeFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={applyPriceRange}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 italic text-lg">No products found.</p>
                <p className="text-slate-300 text-sm mt-1">Try a different keyword, category, or price range.</p>
                <button
                  onClick={() => {
                    setLocalSearch("");
                    setSearchParams(new URLSearchParams());
                  }}
                  className="mt-6 px-6 py-2 bg-royal text-white rounded-full text-sm font-semibold hover:bg-royal/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {showFilters && (
        <MobileFilterSheet
          categories={categories}
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onClose={() => setShowFilters(false)}
          onCategoryChange={(cat) => {
            setParam("category", cat === "All" ? "" : cat);
            setShowFilters(false);
          }}
          onPriceApply={applyPriceRange}
        />
      )}
    </div>
  );
};

// ─── Price Range Filter ────────────────────────────────────────────────────
const PRICE_PRESETS = [
  { label: "Under ₹700", min: "", max: "700" },
  { label: "₹700 – ₹1000", min: "700", max: "1000" },
  { label: "₹1000 – ₹1350", min: "1000", max: "1350" },
  { label: "Above ₹1350", min: "1350", max: "" },
];

const PriceRangeFilter = ({
  minPrice,
  maxPrice,
  onApply,
}: {
  minPrice: string;
  maxPrice: string;
  onApply: (min: string, max: string) => void;
}) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Price Range</h3>

      {/* Presets */}
      <div className="space-y-2 mb-4">
        {PRICE_PRESETS.map((p) => {
          const active = localMin === p.min && localMax === p.max;
          return (
            <button
              key={p.label}
              onClick={() => onApply(p.min, p.max)}
              className={cn(
                "block w-full text-left text-sm py-1 px-2 rounded-lg silk-transition",
                active ? "text-royal font-bold bg-royal/5" : "text-slate-500 hover:text-royal"
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom range */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="Min"
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-royal"
        />
        <span className="text-slate-400 text-xs shrink-0">to</span>
        <input
          type="number"
          placeholder="Max"
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-royal"
        />
      </div>
      <button
        onClick={() => onApply(localMin, localMax)}
        className="mt-3 w-full py-2 bg-royal text-white rounded-full text-sm font-semibold hover:bg-royal/90 transition-colors"
      >
        Apply
      </button>
    </div>
  );
};

// ─── Mobile Filter Sheet ───────────────────────────────────────────────────
const MobileFilterSheet = ({
  categories,
  category,
  minPrice,
  maxPrice,
  onClose,
  onCategoryChange,
  onPriceApply,
}: {
  categories: string[];
  category: string;
  minPrice: string;
  maxPrice: string;
  onClose: () => void;
  onCategoryChange: (cat: string) => void;
  onPriceApply: (min: string, max: string) => void;
}) => (
  <div className="fixed inset-0 z-[100] lg:hidden">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-serif font-bold text-royal">Filters</h2>
        <button onClick={onClose} className="p-2 bg-slate-50 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8">
        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold silk-transition",
                  category === cat ? "bg-royal text-white" : "bg-slate-50 text-slate-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <PriceRangeFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onApply={onPriceApply}
        />
      </div>
    </motion.div>
  </div>
);
