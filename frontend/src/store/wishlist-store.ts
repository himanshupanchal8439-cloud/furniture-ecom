import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  price: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isSaved: (productId: string) => boolean;
  remove: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        set({
          items: exists
            ? get().items.filter((i) => i.productId !== item.productId)
            : [...get().items, item],
        });
      },
      isSaved: (productId) => get().items.some((i) => i.productId === productId),
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
    }),
    { name: "maison-wishlist" }
  )
);
