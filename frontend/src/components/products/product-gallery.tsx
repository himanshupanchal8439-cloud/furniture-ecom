"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const activeImage = images[active];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                active === i ? "border-walnut" : "border-transparent"
              )}
            >
              <Image src={img.url} alt={img.alt_text ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-surface-muted"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setZoomPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
      >
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt_text ?? productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
            className={cn(
              "object-cover transition-transform duration-200 ease-out",
              zooming ? "scale-[1.9] cursor-zoom-out" : "cursor-zoom-in"
            )}
          />
        ) : (
          <div className="h-full w-full skeleton" />
        )}
        <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white">
          Hover to zoom
        </span>
      </div>
    </div>
  );
}
