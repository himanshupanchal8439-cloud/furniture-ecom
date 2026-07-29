"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@/lib/types";

export function DealZone({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-surface-muted py-12 md:py-16">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-walnut">
              <Zap size={13} className="fill-walnut" /> Deal Zone
            </p>
            <h2 className="mt-1 font-serif-display text-2xl md:text-3xl">Today&apos;s Best Prices</h2>
          </div>
          <Link href="/products?sort=price_asc" className="hidden text-sm font-semibold text-walnut underline underline-offset-4 md:block">
            View All
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
