"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/product-card";

export function Recommendations({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ["recommendations", slug],
    queryFn: () => api.products.recommendations(slug, 4),
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="mt-20 border-t border-border-subtle pt-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-foreground/50">Complete the Room</p>
        <h2 className="mt-2 font-serif-display text-2xl md:text-3xl">Pairs well with</h2>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
