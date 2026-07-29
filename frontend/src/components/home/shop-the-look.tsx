"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const LOOKS = [
  {
    title: "Cozy Living Room",
    category: "living-room",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
    video: "https://videos.pexels.com/video-files/4231452/4231452-hd_1920_1080_25fps.mp4",
  },
  {
    title: "Serene Bedroom",
    category: "bedroom",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    video: "https://videos.pexels.com/video-files/5824187/5824187-uhd_1440_2560_24fps.mp4",
  },
  {
    title: "Elegant Dining",
    category: "dining",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80",
    video: "https://videos.pexels.com/video-files/5823588/5823588-uhd_1440_2560_24fps.mp4",
  },
];

export function ShopTheLook() {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Shop The Look</h2>
        <p className="mt-1 text-sm text-foreground/55">Get inspired by complete room setups</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {LOOKS.map((look, i) => (
          <motion.div
            key={look.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link href={`/products?category=${look.category}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={look.image}
                alt={look.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <video
                src={look.video}
                poster={look.image}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-lg font-bold text-white">{look.title}</h3>
                <span className="mt-1 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-bold text-walnut">
                  Shop the Look
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
