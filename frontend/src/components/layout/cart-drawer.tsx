"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

export function CartDrawer() {
  const isOpen = useUiStore((s) => s.isCartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  useBodyScrollLock(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-5">
              <h2 className="font-serif-display text-xl">Your Cart ({lines.length})</h2>
              <button onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 hover:bg-surface-muted">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-foreground/60">
                  <p>Your cart is empty.</p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="mt-4 rounded-full bg-walnut px-5 py-2 text-sm text-white"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  {lines.map((line) => (
                    <li key={line.variantId} className="flex gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        {line.image && (
                          <Image src={line.image} alt={line.productName} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{line.productName}</p>
                          <button onClick={() => removeLine(line.variantId)} className="text-foreground/40 hover:text-foreground">
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-foreground/60">
                          {[line.color, line.material, line.size].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-full border border-border-subtle">
                            <button
                              className="p-1.5"
                              onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm">{line.quantity}</span>
                            <button
                              className="p-1.5"
                              onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-medium">{formatPrice(line.unitPrice * line.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-border-subtle px-6 py-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-serif-display text-lg">{formatPrice(subtotal)}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full rounded-full bg-walnut py-3 text-center text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                >
                  View Cart & Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
