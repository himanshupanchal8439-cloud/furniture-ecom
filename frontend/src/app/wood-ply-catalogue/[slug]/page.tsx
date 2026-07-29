import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { MaterialDetailClient } from "@/components/materials/material-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getMaterial(slug: string) {
  try {
    return await api.materials.get(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const material = await getMaterial(slug);
  if (!material) return { title: "Material Not Found" };

  return {
    title: `${material.name} — Furniture Material Guide`,
    description: material.short_description,
    openGraph: {
      title: material.name,
      description: material.short_description,
      images: material.image_url ? [{ url: material.image_url }] : [],
    },
  };
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const material = await getMaterial(slug);
  if (!material) notFound();

  return <MaterialDetailClient material={material} />;
}
