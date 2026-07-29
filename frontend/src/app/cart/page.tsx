"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FLAT = 49;

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const [coupon, setCoupon] = useState("");

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag size={32} className="text-foreground/30" />
        <h1 className="font-serif-display text-2xl">Your cart is empty</h1>
        <p className="text-sm text-foreground/60">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="mt-2 rounded-full bg-walnut px-6 py-2.5 text-sm text-white">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-serif-display text-3xl md:text-4xl">Your Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border-subtle">
          {lines.map((line) => (
            <li key={line.variantId} className="flex gap-5 py-6">
              <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                {line.image && <Image src={line.image} alt={line.productName} fill className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${line.productSlug}`} className="font-medium hover:text-walnut">
                      {line.productName}
                    </Link>
                    <p className="mt-1 text-sm text-foreground/60">
                      {[line.color, line.material, line.size].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeLine(line.variantId)}
                    aria-label="Remove item"
                    className="text-foreground/40 hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center rounded-full border border-border-subtle">
                    <button
                      className="p-2"
                      onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-7 text-center text-sm">{line.quantity}</span>
                    <button
                      className="p-2"
                      onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-serif-display text-lg">{formatPrice(line.unitPrice * line.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-xl border border-border-subtle bg-surface p-6">
          <h2 className="font-serif-display text-xl">Order Summary</h2>

          <div className="mt-5 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button className="rounded-md border border-border-subtle px-4 py-2 text-sm hover:bg-surface-muted">
              Apply
            </button>
          </div>

          <div className="mt-5 space-y-3 border-t border-border-subtle pt-5 text-sm">
            <div className="flex justify-between text-foreground/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-foreground/50">
                Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
              </p>
            )}
            <div className="flex justify-between border-t border-border-subtle pt-3 font-serif-display text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href={`/checkout${coupon ? `?coupon=${encodeURIComponent(coupon)}` : ""}`}
            className="mt-6 block w-full rounded-full bg-walnut py-3 text-center text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
