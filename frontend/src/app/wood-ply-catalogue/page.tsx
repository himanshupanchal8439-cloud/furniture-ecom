import type { Metadata } from "next";
import { Suspense } from "react";
import { MaterialsPageClient } from "@/components/materials/materials-page-client";

export const metadata: Metadata = {
  title: "Wood & Ply Design Catalogue — Furniture Material Guide",
  description:
    "Browse our wood catalogue and plywood design guide — Teak, Sheesham, Mango, Pine, Oak & Walnut wood types plus BWP, MR, Marine, Block Board, Flexi and Veneer plywood options, with prices, best-use tips and a furniture material guide comparison table.",
};

export default function WoodPlyCataloguePage() {
  return (
    <Suspense fallback={null}>
      <MaterialsPageClient />
    </Suspense>
  );
}
