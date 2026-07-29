"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Product } from "@/lib/types";

const TABS = ["Description", "Dimensions", "Care & Materials", "Reviews"] as const;

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} stars`}>
          <Star size={20} className={cn(n <= value ? "fill-walnut text-walnut" : "text-foreground/25")} />
        </button>
      ))}
    </div>
  );
}

function ReviewsTab({ product }: { product: Product }) {
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", product.id],
    queryFn: () => api.reviews.listForProduct(product.id),
  });

  const alreadyReviewed = reviews?.some((r) => r.user_id === user?.id) ?? false;

  const submitMutation = useMutation({
    mutationFn: () =>
      api.reviews.create({ product_id: product.id, rating, title: title || undefined, body: body || undefined }, accessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", product.id] });
      setShowForm(false);
      setRating(0);
      setTitle("");
      setBody("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not submit review"),
  });

  return (
    <div className="max-w-2xl space-y-8">
      {accessToken && !alreadyReviewed && (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-full border border-walnut px-5 py-2 text-sm font-medium text-walnut"
            >
              Write a Review
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (rating === 0) {
                  setError("Please select a rating");
                  return;
                }
                submitMutation.mutate();
              }}
              className="space-y-3 rounded-xl border border-border-subtle p-4"
            >
              <StarRatingInput value={rating} onChange={setRating} />
              <input
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none"
              />
              <textarea
                placeholder="Share your thoughts (optional)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="rounded-full bg-walnut px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {submitMutation.isPending ? "Submitting…" : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full px-5 py-2 text-sm text-foreground/60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isLoading && <p className="text-foreground/50">Loading reviews…</p>}

      {!isLoading && reviews?.length === 0 && (
        <p className="text-foreground/50">No reviews yet. Be the first to share your thoughts.</p>
      )}

      <div className="space-y-6">
        {reviews?.map((r) => (
          <div key={r.id} className="border-b border-border-subtle pb-6 last:border-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    className={cn(n <= r.rating ? "fill-walnut text-walnut" : "text-foreground/25")}
                  />
                ))}
              </span>
              <span className="text-sm font-medium">{r.user_name}</span>
              <span className="text-xs text-foreground/40">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.title && <p className="mt-1.5 text-sm font-semibold">{r.title}</p>}
            {r.body && <p className="mt-1 text-foreground/70">{r.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Description");

  return (
    <div className="mt-14">
      <div className="flex gap-6 border-b border-border-subtle">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors",
              active === tab ? "text-foreground" : "text-foreground/45 hover:text-foreground/70"
            )}
          >
            {tab === "Reviews" && product.rating_count > 0 ? `Reviews (${product.rating_count})` : tab}
            {active === tab && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-walnut" />}
          </button>
        ))}
      </div>

      <div className="py-8 text-sm leading-relaxed text-foreground/75">
        {active === "Description" && <p className="max-w-2xl">{product.description}</p>}
        {active === "Dimensions" && (
          <div className="max-w-2xl space-y-2">
            <p>{product.dimensions ?? "Dimensions available on request."}</p>
            <p className="text-foreground/50">
              Measurements may vary slightly by ±1&quot; due to handcrafted construction.
            </p>
          </div>
        )}
        {active === "Care & Materials" && (
          <div className="max-w-2xl space-y-2">
            <p>Primary material: {product.material ?? "Mixed materials"}</p>
            <p className="text-foreground/50">
              Wipe clean with a dry or lightly damp cloth. Avoid direct sunlight and heat sources to preserve
              finish and upholstery.
            </p>
          </div>
        )}
        {active === "Reviews" && <ReviewsTab product={product} />}
      </div>
    </div>
  );
}
