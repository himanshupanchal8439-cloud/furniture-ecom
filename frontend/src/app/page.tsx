import { api } from "@/lib/api";
import { Hero } from "@/components/home/hero";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { DealZone } from "@/components/home/deal-zone";
import { ShopTheLook } from "@/components/home/shop-the-look";
import { CraftSection } from "@/components/home/craft-section";
import { Newsletter } from "@/components/home/newsletter";
import type { Category, ProductListItem } from "@/lib/types";

async function getProducts(sort: "newest" | "price_asc"): Promise<ProductListItem[]> {
  try {
    const data = await api.products.list({ sort, page_size: 10 });
    return data.items;
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    return await api.categories.list();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [newArrivals, dealProducts, categories] = await Promise.all([
    getProducts("newest"),
    getProducts("price_asc"),
    getCategories(),
  ]);

  return (
    <>
      <Hero />
      <CategoryShowcase categories={categories} />
      <FeaturedProducts products={newArrivals} />
      <DealZone products={dealProducts} />
      <ShopTheLook />
      <CraftSection />
      <Newsletter />
    </>
  );
}
