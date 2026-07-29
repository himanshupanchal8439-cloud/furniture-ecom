"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import type { Category, CategoryInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const emptyForm: CategoryInput = { name: "", slug: "", description: "", image_url: "" };

export default function AdminCategoriesPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.categories.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });

  const createMutation = useMutation({
    mutationFn: (payload: CategoryInput) => api.categories.create(payload, token),
    onSuccess: () => {
      toast.success("Category created");
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CategoryInput) => api.categories.update(editing!.id, payload, token),
    onSuccess: () => {
      toast.success("Category updated");
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.categories.remove(id, token),
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete category"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image_url: category.image_url ?? "",
      parent_id: category.parent_id,
    });
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, parent_id: form.parent_id || null };
    if (editing) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const parentOptions = categories?.filter((c) => c.id !== editing?.id && !c.parent_id) ?? [];
  const parentName = (id: string | null) => categories?.find((c) => c.id === id)?.name;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.admin.upload(file, token);
      setForm((prev) => ({ ...prev, image_url: result.url }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl">Categories</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage product categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New Category
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Description</TableHead>
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
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className={cn("font-medium", category.parent_id && "pl-6 text-foreground/80")}>
                  {category.parent_id && "↳ "}
                  {category.name}
                </TableCell>
                <TableCell className="text-foreground/60">{category.slug}</TableCell>
                <TableCell className="text-foreground/60">{parentName(category.parent_id) ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate text-foreground/60">
                  {category.description || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(category)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(category)}>
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && categories?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-foreground/50">
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Category</Label>
              <Select
                value={form.parent_id ?? "none"}
                onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? null : v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None (top-level category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level category)</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              {form.image_url && (
                <div className="relative mb-2 h-24 w-full overflow-hidden rounded-lg border border-border-subtle">
                  <Image
                    src={form.image_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="https://… or upload"
                  value={form.image_url ?? ""}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Products in it will keep their reference but the category will no
              longer exist.
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
    </div>
  );
}
