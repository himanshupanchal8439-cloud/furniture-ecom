"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { ProductUpdateInput } from "@/lib/types";
import { ProductForm } from "@/components/admin/product-form";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAuthStore((s) => s.accessToken)!;
  const router = useRouter();

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => api.products.adminGet(id, token),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ProductUpdateInput) => api.products.update(id, payload, token),
    onSuccess: () => {
      toast.success("Product updated");
      router.push("/admin/products");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update product"),
  });

  if (isLoading || !product) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-foreground/40" size={28} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif-display text-2xl">Edit Product</h1>
      <p className="mt-1 text-sm text-foreground/60">{product.name}</p>
      <div className="mt-6 max-w-3xl">
        <ProductForm
          initial={product}
          onSubmit={(payload) => updateMutation.mutate(payload)}
          submitting={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
