"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { MaterialCard } from "@/components/materials/material-card";
import { ComparisonTable } from "@/components/materials/comparison-table";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import type { MaterialFilters } from "@/lib/types";

const TYPE_OPTIONS: { value: MaterialFilters["type"] | "all"; label: string }[] = [
  { value: "all", label: "All Materials" },
  { value: "wood", label: "Wood" },
  { value: "plywood", label: "Plywood" },
];

const FINISH_OPTIONS = ["Natural", "Laminate", "Veneer", "Matte", "Polish"];

const SORT_OPTIONS: { value: NonNullable<MaterialFilters["sort"]>; label: string }[] = [
  { value: "position", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function MaterialsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  useBodyScrollLock(mobileFiltersOpen);

  const filters: MaterialFilters = useMemo(
    () => ({
      type: (searchParams.get("type") as MaterialFilters["type"]) ?? undefined,
      finish: searchParams.get("finish") ?? undefined,
      min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
      max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
      sort: (searchParams.get("sort") as MaterialFilters["sort"]) ?? "position",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      page_size: 24,
    }),
    [searchParams]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["materials", filters],
    queryFn: () => api.materials.list(filters),
  });

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    router.push(`/wood-ply-catalogue?${params.toString()}`);
  };

  const activeType = filters.type ?? "all";
  const activeFinish = filters.finish;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  const FilterContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">Type</h3>
        <ul className="space-y-2">
          {TYPE_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                onClick={() => setParam("type", opt.value === "all" ? null : (opt.value as string))}
                className={cn(
                  "text-sm hover:text-walnut",
                  activeType === opt.value ? "font-medium text-walnut" : "text-foreground/75"
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">Finish</h3>
        <div className="flex flex-wrap gap-2">
          {FINISH_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setParam("finish", activeFinish === f ? null : f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                activeFinish === f ? "border-walnut bg-walnut text-white" : "border-border-subtle hover:border-walnut"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">Price (per unit)</h3>
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
            placeholder="Max"
            defaultValue={filters.max_price ?? ""}
            onBlur={(e) => setParam("max_price", e.target.value)}
            className="w-full rounded-md border border-border-subtle bg-transparent px-2 py-1.5"
          />
        </div>
      </div>

      {(activeType !== "all" || activeFinish || filters.min_price || filters.max_price) && (
        <button
          onClick={() => router.push("/wood-ply-catalogue")}
          className="text-xs font-medium text-foreground/50 underline underline-offset-4 hover:text-walnut"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-walnut">Wood & Ply Design Catalogue</p>
        <h1 className="mt-1 font-serif-display text-2xl md:text-3xl">Material Lookbook</h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground/60">
          Browse our full wood catalogue and plywood design guide — real prices, best-use tips, and durability
          notes for every material we build with, so you can choose furniture materials with confidence.
        </p>
      </div>

      <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-serif-display text-lg">{data ? `${data.total} Materials` : "Materials"}</h2>
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
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[4/3] skeleton rounded-xl" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                  <div className="h-4 w-3/4 skeleton rounded" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-border-subtle bg-surface p-10 text-center text-sm text-foreground/60">
              Couldn&apos;t load the material catalogue. Make sure the backend API is running.
            </div>
          )}

          {data && data.items.length === 0 && (
            <div className="rounded-xl border border-border-subtle bg-surface p-10 text-center text-sm text-foreground/60">
              No materials match those filters. Try clearing a few.
            </div>
          )}

          {data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data.items.map((material) => (
                  <MaterialCard key={material.id} material={material} />
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

      <div className="mt-16">
        <h2 className="mb-4 font-serif-display text-xl">Wood vs Plywood — a quick furniture material guide</h2>
        <ComparisonTable />
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
