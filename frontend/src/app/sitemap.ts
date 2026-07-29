import type { MetadataRoute } from "next";
import { api } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/wishlist`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const [categories, products] = await Promise.all([
      api.categories.list(),
      api.products.list({ page_size: 48 }),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/products?category=${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const productRoutes: MetadataRoute.Sitemap = products.items.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
