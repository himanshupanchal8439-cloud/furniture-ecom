"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GripVertical, Loader2, Plus, Trash2, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Product, ProductImageInput, ProductInput, ProductVariantInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function emptyVariant(): ProductVariantInput {
  return { color: "", material: "", size: "", sku: "", price_delta: 0, stock_quantity: 0, swatch_hex: "" };
}

export function ProductForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: Product;
  onSubmit: (payload: ProductInput & { is_active?: boolean }) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const token = useAuthStore((s) => s.accessToken)!;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.categories.list(),
  });

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    base_price: initial?.base_price ?? "",
    category_id: initial?.category.id ?? "",
    dimensions: initial?.dimensions ?? "",
    material: initial?.material ?? "",
    meta_title: initial?.meta_title ?? "",
    meta_description: initial?.meta_description ?? "",
    video_url: initial?.video_url ?? "",
    is_active: initial?.is_active ?? true,
  });
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initial?.variants.length ? initial.variants.map((v) => ({ ...v })) : [emptyVariant()]
  );
  const [images, setImages] = useState<ProductImageInput[]>(
    initial?.images.length ? initial.images.map((i) => ({ ...i })) : []
  );

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateVariant = (index: number, patch: Partial<ProductVariantInput>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const reorderImages = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((img, i) => ({ ...img, position: i }));
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.admin.upload(file, token);
      setImages((prev) => [...prev, { url: result.url, alt_text: form.name, position: prev.length }]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const result = await api.admin.upload(file, token);
      setForm((prev) => ({ ...prev, video_url: result.url }));
      toast.success("Video uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      variants: variants.filter((v) => v.sku.trim()),
      images,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Base Price (₹)</Label>
              <Input
                required
                type="number"
                step="0.01"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v ?? "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Material</Label>
              <Input value={form.material ?? ""} onChange={(e) => setForm({ ...form, material: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dimensions</Label>
            <Input value={form.dimensions ?? ""} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
          </div>
          {initial && (
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active (visible in storefront)</Label>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Meta Title</Label>
            <Input
              value={form.meta_title ?? ""}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              placeholder="Shown in search engine results"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Meta Description</Label>
            <Textarea
              value={form.meta_description ?? ""}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              placeholder="Shown in search engine results"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Images</CardTitle>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {images.length === 0 && <p className="text-sm text-foreground/50">No images yet.</p>}
          {images.length > 1 && (
            <p className="mb-2 text-xs text-foreground/50">Drag to reorder — first image is the cover photo.</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id ?? image.url}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null && dragIndex !== index) reorderImages(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  "group relative cursor-grab overflow-hidden rounded-lg border border-border-subtle active:cursor-grabbing",
                  dragIndex === index && "opacity-40"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.alt_text ?? ""} className="aspect-square w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-walnut px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Cover
                  </span>
                )}
                <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-full bg-black/60 p-1 text-white">
                    <GripVertical size={12} />
                  </span>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                    className="rounded-full bg-black/60 p-1 text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Or paste an image URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      setImages((prev) => [...prev, { url: value, alt_text: form.name, position: prev.length }]);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Video</CardTitle>
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingVideo}
              onClick={() => videoInputRef.current?.click()}
            >
              {uploadingVideo ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
              Upload Video
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {form.video_url ? (
            <div className="relative max-w-sm overflow-hidden rounded-lg border border-border-subtle">
              <video src={form.video_url} controls className="aspect-video w-full bg-black" />
              <button
                type="button"
                onClick={() => setForm({ ...form, video_url: "" })}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-foreground/50">No video yet.</p>
          )}
          <div className="mt-3 space-y-1.5">
            <Label>Or paste a video URL</Label>
            <Input
              placeholder="https://…"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Variants</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setVariants((prev) => [...prev, emptyVariant()])}>
            <Plus size={14} /> Add Variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant, index) => (
            <div key={variant.id ?? index} className="grid grid-cols-2 gap-3 rounded-lg border border-border-subtle p-4 sm:grid-cols-6">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">SKU</Label>
                <Input
                  required
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, { sku: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Color</Label>
                <Input value={variant.color ?? ""} onChange={(e) => updateVariant(index, { color: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Size</Label>
                <Input value={variant.size ?? ""} onChange={(e) => updateVariant(index, { size: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Price Delta</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variant.price_delta}
                  onChange={(e) => updateVariant(index, { price_delta: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stock</Label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => updateVariant(index, { stock_quantity: Number(e.target.value) })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
