"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { useQuickViewStore } from "@/store/quick-view-store";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";

export function QuickViewModal() {
  const slug = useQuickViewStore((s) => s.slug);
  const close = useQuickViewStore((s) => s.close);
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useUiStore((s) => s.openCart);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.products.get(slug as string),
    enabled: !!slug,
  });

  const variant =
    product?.variants.find((v) => v.id === selectedVariantId) ?? product?.variants[0];
  const price = product ? parseFloat(product.base_price) + parseFloat(variant?.price_delta ?? "0") : 0;

  const handleAddToCart = () => {
    if (!product || !variant) return;
    addLine({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0]?.url ?? null,
      color: variant.color,
      material: variant.material,
      size: variant.size,
      unitPrice: price,
      stockQuantity: variant.stock_quantity,
    });
    close();
    openCart();
  };

  return (
    <AnimatePresence>
      {slug && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-3xl -translate-y-1/2 overflow-hidden rounded-2xl bg-surface shadow-2xl md:inset-x-0"
          >
            <button
              onClick={close}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal"
            >
              <X size={18} />
            </button>

            {isLoading || !product ? (
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                <div className="aspect-square skeleton rounded-xl" />
                <div className="space-y-3 py-4">
                  <div className="h-4 w-1/3 skeleton rounded" />
                  <div className="h-6 w-2/3 skeleton rounded" />
                  <div className="h-4 w-1/4 skeleton rounded" />
                </div>
              </div>
            ) : (
              <div className="grid max-h-[85vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
                <div className="relative aspect-square bg-surface-muted md:aspect-auto">
                  {product.images[0] && (
                    <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex flex-col p-6 md:p-8">
                  <p className="text-xs uppercase tracking-wide text-foreground/50">{product.category.name}</p>
                  <h2 className="mt-1 font-serif-display text-2xl">{product.name}</h2>
                  <p className="mt-2 font-serif-display text-xl">{formatPrice(price)}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/70">{product.description}</p>

                  {product.variants.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">
                        Color{variant?.color ? `: ${variant.color}` : ""}
                      </p>
                      <div className="flex gap-2">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariantId(v.id)}
                            aria-label={v.color ?? v.sku}
                            style={{ backgroundColor: v.swatch_hex ?? "#ccc" }}
                            className={cn(
                              "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                              selectedVariantId === v.id ? "border-walnut" : "border-transparent"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3 pt-6">
                    <button
                      onClick={handleAddToCart}
                      disabled={!variant || variant.stock_quantity === 0}
                      className="w-full rounded-full bg-walnut py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {variant && variant.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={close}
                      className="w-full rounded-full border border-border-subtle py-3 text-center text-sm font-medium hover:bg-surface-muted"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
