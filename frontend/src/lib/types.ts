export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  product_count: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  color: string | null;
  material: string | null;
  size: string | null;
  sku: string;
  price_delta: string;
  stock_quantity: number;
  swatch_hex: string | null;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: string;
  category: Category;
  images: ProductImage[];
  rating_avg: number;
  rating_count: number;
}

export interface Product extends ProductListItem {
  description: string;
  dimensions: string | null;
  material: string | null;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  video_url: string | null;
  variants: ProductVariant[];
}

export interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  color?: string;
  material?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  page_size?: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: "customer" | "admin";
  is_active: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  variant_id: string;
  product_name: string;
  variant_label: string | null;
  unit_price: string;
  quantity: number;
}

export interface Order {
  id: string;
  status: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  grand_total: string;
  coupon_code: string | null;
  payment_provider: "stripe" | "razorpay" | null;
  payment_reference: string | null;
  tracking_number: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface AdminOrder extends Order {
  user: { id: string; full_name: string; email: string };
  address: Address;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

export interface AdminReview extends Review {
  user_name: string;
  product_name: string;
}

export interface ProductReview extends Review {
  user_name: string;
}

export interface Coupon {
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  is_active: boolean;
  max_redemptions: number | null;
  times_redeemed: number;
}

export interface CouponInput {
  code: string;
  percent_off?: number | null;
  amount_off?: number | null;
  max_redemptions?: number | null;
}

export interface CouponUpdateInput {
  percent_off?: number | null;
  amount_off?: number | null;
  max_redemptions?: number | null;
  is_active?: boolean;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
}

export interface ProductVariantInput {
  id?: string;
  color?: string | null;
  material?: string | null;
  size?: string | null;
  sku: string;
  price_delta: string | number;
  stock_quantity: number;
  swatch_hex?: string | null;
}

export interface ProductImageInput {
  id?: string;
  url: string;
  alt_text?: string | null;
  position?: number;
}

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  base_price: string | number;
  category_id: string;
  dimensions?: string | null;
  material?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  video_url?: string | null;
  variants: ProductVariantInput[];
  images: ProductImageInput[];
}

export interface ProductUpdateInput extends Partial<Omit<ProductInput, "variants" | "images">> {
  is_active?: boolean;
  variants?: ProductVariantInput[];
  images?: ProductImageInput[];
}

export type MaterialType = "wood" | "plywood";

export interface MaterialListItem {
  id: string;
  name: string;
  slug: string;
  type: MaterialType;
  subtype: string | null;
  short_description: string;
  best_use: string | null;
  finish: string | null;
  price_min: string | null;
  price_max: string | null;
  image_url: string | null;
  waterproof: boolean;
}

export interface Material extends MaterialListItem {
  details: string | null;
  durability_rating: string | null;
  warranty_info: string | null;
  is_active: boolean;
  position: number;
}

export interface PaginatedMaterials {
  items: MaterialListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface MaterialFilters {
  type?: MaterialType;
  finish?: string;
  q?: string;
  min_price?: number;
  max_price?: number;
  sort?: "position" | "price_asc" | "price_desc" | "newest";
  page?: number;
  page_size?: number;
}

export interface MaterialInput {
  name: string;
  slug: string;
  type: MaterialType;
  subtype?: string | null;
  short_description: string;
  details?: string | null;
  best_use?: string | null;
  finish?: string | null;
  price_min?: string | number | null;
  price_max?: string | number | null;
  image_url?: string | null;
  durability_rating?: string | null;
  waterproof?: boolean;
  warranty_info?: string | null;
  is_active?: boolean;
  position?: number;
}

export type MaterialUpdateInput = Partial<MaterialInput>;

export type QuoteRequestStatus = "new" | "contacted";

export interface QuoteRequest {
  id: string;
  material_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: QuoteRequestStatus;
}

export interface QuoteRequestInput {
  material_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
}

export interface AdminStats {
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_products: number;
  total_users: number;
  low_stock_variants: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  status: string;
  grand_total: number;
  created_at: string;
  user: { full_name: string; email: string };
}
