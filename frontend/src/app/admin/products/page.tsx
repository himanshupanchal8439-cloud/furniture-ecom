"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice, cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminProductsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", search, page],
    queryFn: () => api.products.adminList({ q: search || undefined, page, page_size: 20 }, token),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.products.remove(id, token),
    onSuccess: () => {
      toast.success("Product deleted");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete product"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.products.remove(id, token)));
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} product(s) deleted`);
      invalidate();
      setSelected(new Set());
      setBulkDeleteOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete some products"),
  });

  const bulkActiveMutation = useMutation({
    mutationFn: async ({ ids, is_active }: { ids: string[]; is_active: boolean }) => {
      await Promise.all(ids.map((id) => api.products.update(id, { is_active }, token)));
    },
    onSuccess: (_, { ids, is_active }) => {
      toast.success(`${ids.length} product(s) ${is_active ? "activated" : "deactivated"}`);
      invalidate();
      setSelected(new Set());
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update some products"),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  const items = data?.items ?? [];
  const allSelected = items.length > 0 && items.every((p) => selected.has(p.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl">Products</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage your product catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
          <Link href="/admin/products/new" className={cn(buttonVariants(), "gap-1.5")}>
            <Plus size={16} /> New Product
          </Link>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => bulkActiveMutation.mutate({ ids: [...selected], is_active: true })}
          >
            <CheckCircle2 size={14} /> Activate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => bulkActiveMutation.mutate({ ids: [...selected], is_active: false })}
          >
            <EyeOff size={14} /> Deactivate
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
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
            {items.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleOne(product.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].url}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 rounded-md object-cover"
                      />
                    )}
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.category.name}</Badge>
                </TableCell>
                <TableCell>{formatPrice(product.base_price)}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                  >
                    <Pencil size={14} />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-foreground/50">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-foreground/60">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product, its variants, and its images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} product(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected products, their variants, and their images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkDeleteMutation.mutate([...selected])}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
