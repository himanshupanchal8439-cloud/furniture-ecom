"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { MEGA_MENU } from "@/lib/nav-data";
import { FILTER_COLORS, FILTER_MATERIALS, PRICE_MAX } from "@/lib/filter-data";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { ProductFilters } from "@/lib/types";

const SORT_OPTIONS: { value: NonNullable<ProductFilters["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters: ProductFilters = useMemo(
    () => ({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      color: searchParams.get("color") ?? undefined,
      material: searchParams.get("material") ?? undefined,
      min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
      max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
      sort: (searchParams.get("sort") as ProductFilters["sort"]) ?? "newest",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      page_size: 12,
    }),
    [searchParams]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => api.products.list(filters),
  });

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== "page") params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const activeCategory = filters.category;
  const activeColor = filters.color;
  const activeMaterial = filters.material;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  const FilterContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">Category</h3>
        <ul className="space-y-2">
          {MEGA_MENU.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => setParam("category", activeCategory === cat.slug ? null : cat.slug)}
                className={cn(
                  "text-sm hover:text-walnut",
                  activeCategory === cat.slug ? "font-medium text-walnut" : "text-foreground/75"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">Price</h3>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={filters.min_price ?? ""}
            onBlur={(e) => setParam("min_price", e.target.value)}
            className="w-full rounded-md border border-border-subtle bg-transparent px-2 py-1.5"
          />
          <span className="text-foreground/40">–</span>
          <input
            type="number"
            min={0}
            max={PRICE_MAX}
            placeholder="Max"
            defaultValue={filters.max_price ?? ""}
            onBlur={(e) => setParam("max_price", e.target.value)}
            className="w-full rounded-md border border-border-subtle bg-transparent px-2 py-1.5"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">Color</h3>
        <div className="flex flex-wrap gap-2">
          {FILTER_COLORS.map((c) => (
            <button
              key={c.label}
              onClick={() => setParam("color", activeColor === c.label ? null : c.label)}
              aria-label={c.label}
              title={c.label}
              style={{ backgroundColor: c.hex }}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                activeColor === c.label ? "border-walnut" : "border-transparent"
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">Material</h3>
        <div className="flex flex-wrap gap-2">
          {FILTER_MATERIALS.map((m) => (
            <button
              key={m}
              onClick={() => setParam("material", activeMaterial === m ? null : m)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                activeMaterial === m
                  ? "border-walnut bg-walnut text-white"
                  : "border-border-subtle hover:border-walnut"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {(activeCategory || activeColor || activeMaterial || filters.min_price || filters.max_price) && (
        <button
          onClick={() => router.push("/products")}
          className="text-xs font-medium text-foreground/50 underline underline-offset-4 hover:text-walnut"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-walnut">
            {filters.q ? `Results for "${filters.q}"` : "Shop All"}
          </p>
          <h1 className="mt-1 font-serif-display text-2xl md:text-3xl">
            {data ? `${data.total} Products` : "Furniture"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-sm md:hidden"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <select
            value={filters.sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="rounded-full border border-border-subtle bg-transparent px-4 py-2 text-sm font-medium outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">{FilterContent}</aside>

        <div>
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[4/5] skeleton rounded-xl" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                  <div className="h-4 w-3/4 skeleton rounded" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-border-subtle bg-surface p-10 text-center text-sm text-foreground/60">
              Couldn&apos;t reach the catalog service. Make sure the backend API is running.
            </div>
          )}

          {data && data.items.length === 0 && (
            <div className="rounded-xl border border-border-subtle bg-surface p-10 text-center text-sm text-foreground/60">
              No pieces match those filters. Try clearing a few.
            </div>
          )}

          {data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setParam("page", String(i + 1))}
                      className={cn(
                        "h-9 w-9 rounded-full text-sm",
                        (filters.page ?? 1) === i + 1
                          ? "bg-walnut text-white"
                          : "border border-border-subtle hover:border-walnut"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-surface p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif-display text-lg">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}
    </div>
  );
}
