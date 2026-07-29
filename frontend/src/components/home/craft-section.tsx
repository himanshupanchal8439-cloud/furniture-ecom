"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Truck } from "lucide-react";

const PILLARS = [
  { icon: Truck, title: "Free Shipping", body: "On all orders across India, delivered to your doorstep." },
  { icon: BadgeCheck, title: "Secure Payments", body: "100% secure checkout with multiple payment options." },
];

export function CraftSection() {
  return (
    <section className="border-y border-border-subtle bg-surface py-12 md:py-16">
      <div className="container-page grid grid-cols-1 gap-8 sm:grid-cols-2 sm:max-w-md sm:mx-auto">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col items-center text-center md:items-start md:text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-walnut/10 text-walnut">
              <p.icon size={22} />
            </div>
            <h3 className="mt-3 text-sm font-bold">{p.title}</h3>
            <p className="mt-1 text-xs text-foreground/60">{p.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
