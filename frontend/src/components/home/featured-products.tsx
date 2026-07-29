"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@/lib/types";

export function FeaturedProducts({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <section className="container-page py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex items-end justify-between"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-walnut">New Arrivals</p>
          <h2 className="mt-1 font-serif-display text-2xl md:text-3xl">Fresh off the floor</h2>
        </div>
        <Link href="/products" className="hidden text-sm font-semibold text-walnut underline underline-offset-4 md:block">
          View All
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 2} />
        ))}
      </div>

      <Link
        href="/products"
        className="mt-10 block text-center text-sm font-medium underline underline-offset-4 hover:text-walnut md:hidden"
      >
        View All Products
      </Link>
    </section>
  );
}
