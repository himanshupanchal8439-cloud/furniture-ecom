"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { ProductInput } from "@/lib/types";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: (payload: ProductInput) => api.products.create(payload, token),
    onSuccess: () => {
      toast.success("Product created");
      router.push("/admin/products");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to create product"),
  });

  return (
    <div>
      <h1 className="font-serif-display text-2xl">New Product</h1>
      <p className="mt-1 text-sm text-foreground/60">Add a new product to your catalog.</p>
      <div className="mt-6 max-w-3xl">
        <ProductForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          submitting={createMutation.isPending}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
}
