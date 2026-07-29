"use client";

import Image from "next/image";
import Link from "next/link";
import type { MaterialListItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function MaterialCard({ material }: { material: MaterialListItem }) {
  return (
    <Link
      href={`/wood-ply-catalogue/${material.slug}`}
      className="group block overflow-hidden rounded-xl border border-border-subtle bg-surface transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {material.image_url ? (
          <Image
            src={material.image_url}
            alt={material.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full skeleton" />
        )}
        <span className="absolute left-2 top-2 rounded-md bg-walnut px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          {material.type === "wood" ? "Wood" : "Plywood"}
        </span>
      </div>

      <div className="p-3.5">
        {material.subtype && <p className="text-[11px] uppercase tracking-wide text-foreground/50">{material.subtype}</p>}
        <h3 className="mt-0.5 font-serif-display text-base">{material.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-foreground/60">{material.short_description}</p>

        {material.best_use && (
          <p className="mt-2 text-[11px] font-medium text-walnut">Best for: {material.best_use}</p>
        )}

        {(material.price_min || material.price_max) && (
          <p className="mt-2 text-sm font-semibold">
            {material.price_min ? formatPrice(material.price_min) : "—"}
            {material.price_max ? ` – ${formatPrice(material.price_max)}` : ""}
            <span className="ml-1 text-[11px] font-normal text-foreground/45">per sq.ft/unit</span>
          </p>
        )}
      </div>
    </Link>
  );
}
