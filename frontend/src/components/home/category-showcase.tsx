"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { MEGA_MENU } from "@/lib/nav-data";
import type { Category } from "@/lib/types";

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const countBySlug = new Map(categories.map((c) => [c.slug, c.product_count]));

  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Shop by Category</h2>
        <p className="mt-1 text-sm text-foreground/55">Browse our most-loved furniture collections</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {MEGA_MENU.map((cat, i) => {
          const count = countBySlug.get(cat.slug) ?? 0;
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-surface-muted shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 p-2.5">
                  <div>
                    <p className="text-xs font-bold text-white md:text-sm">{cat.name}</p>
                    <p className="text-[10px] text-white/75">
                      {count > 0 ? `${count} item${count === 1 ? "" : "s"}` : "Shop now"}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="mb-0.5 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
