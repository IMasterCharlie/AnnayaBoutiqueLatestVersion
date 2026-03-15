import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  wishlist: string[]; // product IDs
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      toggleWishlist: (id) => {
        const current = get().wishlist;
        if (current.includes(id)) {
          set({ wishlist: current.filter((i) => i !== id) });
        } else {
          set({ wishlist: [...current, id] });
        }
      },
      isInWishlist: (id) => get().wishlist.includes(id),
    }),
    { name: "annaya-wishlist" }
  )
);
