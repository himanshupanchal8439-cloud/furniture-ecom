"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { ProductListItem } from "@/lib/types";
import { formatPrice, cn, deriveDeal } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";
import { useQuickViewStore } from "@/store/quick-view-store";

export function ProductCard({ product, priority = false }: { product: ProductListItem; priority?: boolean }) {
  const image = product.images[0]?.url;
  const isSaved = useWishlistStore((s) => s.isSaved(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const openQuickView = useQuickViewStore((s) => s.open);
  const price = parseFloat(product.base_price);
  const { discountPct, mrp } = deriveDeal(price, product.id);
  const rating = product.rating_avg;
  const reviews = product.rating_count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="group relative rounded-xl border border-border-subtle bg-surface p-2 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted">
        <span className="absolute left-2 top-2 z-10 rounded-md bg-walnut px-2 py-1 text-[11px] font-bold text-white">
          {discountPct}% OFF
        </span>

        <Link href={`/products/${product.slug}`}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full skeleton" />
          )}
        </Link>

        <button
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              image: image ?? null,
              price,
            })
          }
          aria-label="Toggle wishlist"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-transform hover:scale-110"
        >
          <Heart size={15} className={cn(isSaved && "fill-walnut text-walnut")} />
        </button>

        <button
          onClick={() => openQuickView(product.slug)}
          className="absolute inset-x-2 bottom-2 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-charcoal/90 py-2 text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye size={13} /> Quick View
        </button>
      </div>

      <Link href={`/products/${product.slug}`} className="mt-2.5 block px-1 pb-1">
        <p className="text-[11px] uppercase tracking-wide text-foreground/50">{product.category.name}</p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold">{product.name}</h3>

        {reviews > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <span className="flex items-center gap-0.5 rounded bg-green-600/10 px-1.5 py-0.5 text-[11px] font-bold text-green-700 dark:text-green-400">
              {rating.toFixed(1)} <Star size={10} className="fill-current" />
            </span>
            <span className="text-[11px] text-foreground/45">({reviews})</span>
          </div>
        )}

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-extrabold">{formatPrice(price.toString())}</span>
          <span className="text-xs text-foreground/40 line-through">{formatPrice(mrp.toString())}</span>
        </div>
      </Link>
    </motion.div>
  );
}
