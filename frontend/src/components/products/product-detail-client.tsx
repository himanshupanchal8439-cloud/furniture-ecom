"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { ProductGallery } from "@/components/products/product-gallery";
import { DeliveryEstimator } from "@/components/products/delivery-estimator";
import { ProductTabs } from "@/components/products/product-tabs";
import { Recommendations } from "@/components/products/recommendations";
import { formatPrice, cn, deriveDeal } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUiStore } from "@/store/ui-store";
import type { Product } from "@/lib/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useUiStore((s) => s.openCart);
  const isSaved = useWishlistStore((s) => s.isSaved(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const variant = product.variants.find((v) => v.id === selectedVariantId);
  const price = parseFloat(product.base_price) + parseFloat(variant?.price_delta ?? "0");
  const outOfStock = variant ? variant.stock_quantity === 0 : false;
  const { discountPct, mrp } = deriveDeal(price, product.id);
  const rating = product.rating_avg;
  const reviews = product.rating_count;

  const handleAddToCart = () => {
    if (!variant) return;
    addLine(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        image: product.images[0]?.url ?? null,
        color: variant.color,
        material: variant.material,
        size: variant.size,
        unitPrice: price,
        stockQuantity: variant.stock_quantity,
      },
      quantity
    );
    openCart();
  };

  return (
    <div className="container-page py-10 md:py-14">
      <nav className="mb-6 text-xs text-foreground/50">
        <Link href="/" className="hover:text-walnut">Home</Link>
        {" / "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-walnut">
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">{product.category.name}</p>
          <h1 className="mt-1 font-serif-display text-2xl md:text-3xl">{product.name}</h1>

          {reviews > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-green-600/10 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-400">
                {rating.toFixed(1)} <Star size={11} className="fill-current" />
              </span>
              <span className="text-xs text-foreground/50">{reviews} ratings</span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-foreground/50">No ratings yet</p>
          )}

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className="font-serif-display text-3xl">{formatPrice(price)}</span>
            <span className="text-base text-foreground/40 line-through">{formatPrice(mrp)}</span>
            <span className="text-sm font-bold text-walnut">{discountPct}% off</span>
          </div>
          <p className="mt-1 text-xs text-foreground/45">Inclusive of all taxes</p>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">
                Color{variant?.color ? `: ${variant.color}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    aria-label={v.color ?? v.sku}
                    title={v.color ?? v.sku}
                    style={{ backgroundColor: v.swatch_hex ?? "#ccc" }}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition-transform hover:scale-110",
                      selectedVariantId === v.id ? "border-walnut" : "border-transparent"
                    )}
                  />
                ))}
              </div>
              {variant && (
                <p className="mt-2 text-xs text-foreground/50">
                  {variant.stock_quantity > 0 ? `${variant.stock_quantity} in stock` : "Out of stock"}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-border-subtle">
              <button
                className="p-2.5"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button className="p-2.5" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 rounded-full bg-walnut py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  productSlug: product.slug,
                  productName: product.name,
                  image: product.images[0]?.url ?? null,
                  price,
                })
              }
              aria-label="Toggle wishlist"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-subtle hover:bg-surface-muted"
            >
              <Heart size={18} className={cn(isSaved && "fill-walnut text-walnut")} />
            </button>
          </div>

          <div className="mt-8">
            <DeliveryEstimator />
          </div>
        </div>
      </div>

      <ProductTabs product={product} />
      <Recommendations slug={product.slug} />
    </div>
  );
}
