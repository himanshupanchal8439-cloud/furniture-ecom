"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative -mt-px h-[calc(92vh+1px)] min-h-[561px] overflow-hidden">
      <motion.div style={{ y }} className="absolute -top-1 inset-x-0 bottom-0 h-[calc(130%+4px)]">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=2000&q=80"
          className="h-full w-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="container-page relative flex h-full flex-col justify-end pb-24 text-white md:justify-center md:pb-0"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-4 inline-flex w-fit items-center rounded-full bg-walnut px-4 py-1.5 text-xs font-bold uppercase tracking-wide"
        >
          Festive Season Sale
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-2xl text-balance font-serif-display text-5xl leading-[1.05] md:text-7xl"
        >
          Buy Furniture Online: Upto 70% Off
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 max-w-md text-balance text-white/85"
        >
          Additional up to ₹10,000 off. Use code <span className="font-bold text-white">EXTRA10K</span> at checkout.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            href="/products"
            className="whitespace-nowrap rounded-full bg-walnut px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            Shop Now
          </Link>
          <Link
            href="/products?category=living-room"
            className="whitespace-nowrap rounded-full border border-white/60 px-7 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Explore Living Room
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
