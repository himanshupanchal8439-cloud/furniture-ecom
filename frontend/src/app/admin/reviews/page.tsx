"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminReviewsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => api.admin.reviews.list(token),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.reviews.remove(id, token),
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete review"),
  });

  return (
    <div>
      <h1 className="font-serif-display text-2xl">Reviews</h1>
      <p className="mt-1 text-sm text-foreground/60">Moderate customer reviews.</p>

      <div className="mt-6 rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-foreground/50">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {reviews?.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.product_name}</TableCell>
                <TableCell className="text-foreground/60">{review.user_name}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    {review.rating} <Star size={12} className="fill-current text-walnut" />
                  </span>
                </TableCell>
                <TableCell className="max-w-sm truncate">{review.title || review.body || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(review.id)}>
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && reviews?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-foreground/50">
                  No reviews yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
