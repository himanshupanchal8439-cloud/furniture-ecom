"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-serif-display text-3xl md:text-4xl">Your Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-surface p-16 text-center">
          <Heart size={28} className="text-foreground/30" />
          <p className="text-foreground/60">Nothing saved yet.</p>
          <Link href="/products" className="rounded-full bg-walnut px-6 py-2.5 text-sm text-white">
            Browse the Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.productId} className="group relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-muted">
                <Link href={`/products/${item.productSlug}`}>
                  {item.image && <Image src={item.image} alt={item.productName} fill className="object-cover" />}
                </Link>
                <button
                  onClick={() => remove(item.productId)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>
              <Link href={`/products/${item.productSlug}`} className="mt-3 block">
                <h3 className="text-sm font-medium">{item.productName}</h3>
                <p className="mt-1 font-serif-display text-base">{formatPrice(item.price)}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
