"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Droplets, ShieldCheck } from "lucide-react";
import type { Material } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { RequestSampleDialog } from "@/components/materials/request-sample-dialog";
import { Button } from "@/components/ui/button";

export function MaterialDetailClient({ material }: { material: Material }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container-page py-10 md:py-14">
      <nav className="mb-6 text-xs text-foreground/50">
        <Link href="/" className="hover:text-walnut">Home</Link>
        {" / "}
        <Link href="/wood-ply-catalogue" className="hover:text-walnut">Wood &amp; Ply Design Catalogue</Link>
        {" / "}
        <span className="text-foreground">{material.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted">
          {material.image_url ? (
            <Image src={material.image_url} alt={material.name} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full skeleton" />
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-walnut">
            {material.type === "wood" ? "Wood Type" : "Plywood Type"}
            {material.subtype ? ` · ${material.subtype}` : ""}
          </p>
          <h1 className="mt-1 font-serif-display text-3xl">{material.name}</h1>

          {(material.price_min || material.price_max) && (
            <p className="mt-3 text-xl font-semibold">
              {material.price_min ? formatPrice(material.price_min) : "—"}
              {material.price_max ? ` – ${formatPrice(material.price_max)}` : ""}
              <span className="ml-1.5 text-sm font-normal text-foreground/45">per sq.ft/unit</span>
            </p>
          )}

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">{material.short_description}</p>
          {material.details && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">{material.details}</p>
          )}

          <div className="mt-6 space-y-2.5">
            {material.best_use && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-walnut" />
                <span><strong className="font-medium">Best for:</strong> {material.best_use}</span>
              </div>
            )}
            {material.durability_rating && (
              <div className="flex items-start gap-2 text-sm">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-walnut" />
                <span><strong className="font-medium">Durability:</strong> {material.durability_rating}</span>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm">
              <Droplets size={16} className="mt-0.5 shrink-0 text-walnut" />
              <span>
                <strong className="font-medium">Water resistance:</strong>{" "}
                {material.waterproof ? "Waterproof" : "Not fully waterproof"}
              </span>
            </div>
            {material.warranty_info && (
              <div className="flex items-start gap-2 text-sm">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-walnut" />
                <span><strong className="font-medium">Warranty:</strong> {material.warranty_info}</span>
              </div>
            )}
            {material.finish && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-walnut" />
                <span><strong className="font-medium">Finish options:</strong> {material.finish}</span>
              </div>
            )}
          </div>

          <Button className="mt-8" size="lg" onClick={() => setDialogOpen(true)}>
            Request a Sample / Get a Quote
          </Button>
        </div>
      </div>

      <RequestSampleDialog
        materialId={material.id}
        materialName={material.name}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
