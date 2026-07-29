"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-walnut py-16 text-white md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container-page flex flex-col items-center text-center"
      >
        <h2 className="max-w-lg text-balance font-serif-display text-3xl md:text-4xl">
          Get 10% off your first order
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/70">
          Join our list for new arrivals, styling guides, and members-only offers.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="mt-8 flex w-full max-w-md gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 rounded-full border border-white/25 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-white/50 focus:border-white/60"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-medium text-charcoal transition-transform hover:scale-105"
          >
            {submitted ? "Subscribed ✓" : "Subscribe"}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
