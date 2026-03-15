import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlistStore } from "../store/wishlistStore";
import { ProductCard } from "../components/products/ProductCard";
import { useEffect, useState } from "react";
import axios from "axios";

export const Wishlist = () => {
  const { wishlist } = useWishlistStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (wishlist.length === 0) {
        setLoading(false);
        return;
      }
      try {
        // In a real app, you'd have a specific endpoint for this
        const res = await axios.get("/api/products");
        setProducts(res.data.filter((p: any) => wishlist.includes(p._id)));
      } catch (err) {
        console.error("Error fetching wishlist products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [wishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 pt-20">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-royal mb-4">Your Wishlist is Empty</h2>
        <p className="text-slate-500 mb-8 text-center max-w-xs">
          Save items you love by tapping the heart icon on any product.
        </p>
        <Link
          to="/products"
          className="px-8 py-4 bg-royal text-white font-bold rounded-full hover:shadow-lg transition-all"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-10 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-serif font-bold text-royal mb-10">My Wishlist</h1>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
