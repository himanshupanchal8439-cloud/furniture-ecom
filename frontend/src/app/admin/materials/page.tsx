"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { cn, formatPrice } from "@/lib/utils";
import type { Material, MaterialInput } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const emptyForm: MaterialInput = {
  name: "",
  slug: "",
  type: "wood",
  subtype: "",
  short_description: "",
  details: "",
  best_use: "",
  finish: "",
  price_min: "",
  price_max: "",
  image_url: "",
  durability_rating: "",
  waterproof: false,
  warranty_info: "",
  is_active: true,
  position: 0,
};

export default function AdminMaterialsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: materials, isLoading } = useQuery({
    queryKey: ["admin", "materials"],
    queryFn: () => api.materials.adminList(token),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "materials"] });

  const createMutation = useMutation({
    mutationFn: (payload: MaterialInput) => api.materials.create(payload, token),
    onSuccess: () => {
      toast.success("Material created");
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to create material"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: MaterialInput) => api.materials.update(editing!.id, payload, token),
    onSuccess: () => {
      toast.success("Material updated");
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update material"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.materials.remove(id, token),
    onSuccess: () => {
      toast.success("Material deleted");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete material"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (material: Material) => {
    setEditing(material);
    setForm({
      name: material.name,
      slug: material.slug,
      type: material.type,
      subtype: material.subtype ?? "",
      short_description: material.short_description,
      details: material.details ?? "",
      best_use: material.best_use ?? "",
      finish: material.finish ?? "",
      price_min: material.price_min ?? "",
      price_max: material.price_max ?? "",
      image_url: material.image_url ?? "",
      durability_rating: material.durability_rating ?? "",
      waterproof: material.waterproof,
      warranty_info: material.warranty_info ?? "",
      is_active: material.is_active,
      position: material.position,
    });
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate(form);
    else createMutation.mutate(form);
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl">Materials</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Manage the Wood &amp; Ply Design Catalogue shown on the storefront.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/materials/quote-requests" className={cn(buttonVariants({ variant: "outline" }))}>
            <MessageSquare size={16} /> Quote Requests
          </Link>
          <Button onClick={openCreate}>
            <Plus size={16} /> New Material
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Best Use</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-foreground/50">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {materials?.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">
                  {material.name}
                  {material.subtype && <span className="ml-2 text-xs text-foreground/45">{material.subtype}</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {material.type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-foreground/60">{material.best_use || "—"}</TableCell>
                <TableCell className="text-foreground/60">
                  {material.price_min ? formatPrice(material.price_min) : "—"}
                  {material.price_max ? ` – ${formatPrice(material.price_max)}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={material.is_active ? "default" : "secondary"}>
                    {material.is_active ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(material)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(material)}>
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && materials?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-foreground/50">
                  No materials yet. Add your first wood or plywood entry.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Material" : "New Material"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MaterialInput["type"] })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wood">Wood</SelectItem>
                    <SelectItem value="plywood">Plywood</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subtype / Grade</Label>
                <Input
                  value={form.subtype ?? ""}
                  onChange={(e) => setForm({ ...form, subtype: e.target.value })}
                  placeholder="e.g. BWP Grade"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Short Description (2-3 lines)</Label>
              <Textarea
                required
                rows={2}
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Details (applications, durability, notes)</Label>
              <Textarea
                rows={3}
                value={form.details ?? ""}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Best Use</Label>
                <Input
                  value={form.best_use ?? ""}
                  onChange={(e) => setForm({ ...form, best_use: e.target.value })}
                  placeholder="Bedroom, Living Room"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Finish Options</Label>
                <Input
                  value={form.finish ?? ""}
                  onChange={(e) => setForm({ ...form, finish: e.target.value })}
                  placeholder="Natural, Laminate"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price Min</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_min ?? ""}
                  onChange={(e) => setForm({ ...form, price_min: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price Max</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_max ?? ""}
                  onChange={(e) => setForm({ ...form, price_max: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Durability Rating</Label>
                <Input
                  value={form.durability_rating ?? ""}
                  onChange={(e) => setForm({ ...form, durability_rating: e.target.value })}
                  placeholder="e.g. High"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Warranty Info</Label>
                <Input
                  value={form.warranty_info ?? ""}
                  onChange={(e) => setForm({ ...form, warranty_info: e.target.value })}
                  placeholder="e.g. 5-year warranty"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.waterproof} onCheckedChange={(v) => setForm({ ...form, waterproof: v })} />
              <Label>Waterproof</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active (visible on storefront)</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Image</Label>
              {form.image_url && (
                <div className="relative mb-2 h-32 w-full overflow-hidden rounded-lg border border-border-subtle">
                  <Image src={form.image_url} alt="" fill className="object-cover" />
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
                {editing ? "Save Changes" : "Create Material"}
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
              This will remove the material from the storefront catalogue permanently.
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
