import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  variantId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  color: string | null;
  material: string | null;
  size: string | null;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line, quantity = 1) => {
        const existing = get().lines.find((l) => l.variantId === line.variantId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.variantId === line.variantId ? { ...l, quantity: l.quantity + quantity } : l
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line, quantity }] });
        }
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.variantId !== variantId) });
          return;
        }
        set({ lines: get().lines.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)) });
      },
      removeLine: (variantId) => set({ lines: get().lines.filter((l) => l.variantId !== variantId) }),
      clear: () => set({ lines: [] }),
    }),
    { name: "maison-cart" }
  )
);

export const useCartCount = () => useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
export const useCartSubtotal = () =>
  useCartStore((s) => s.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));
