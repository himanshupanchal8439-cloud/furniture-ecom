import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsPageClient } from "@/components/products/products-page-client";

export const metadata: Metadata = {
  title: "Shop All Furniture",
  description: "Browse sofas, dining tables, bedroom sets, office furniture and decor.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageClient />
    </Suspense>
  );
}
