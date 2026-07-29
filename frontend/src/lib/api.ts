import type {
  Address,
  AdminOrder,
  AdminReview,
  AdminStats,
  RecentOrder,
  RevenueTrendPoint,
  CategoryInput,
  Coupon,
  CouponInput,
  CouponUpdateInput,
  Material,
  MaterialFilters,
  MaterialInput,
  MaterialUpdateInput,
  Order,
  PaginatedMaterials,
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductInput,
  ProductReview,
  ProductUpdateInput,
  QuoteRequest,
  QuoteRequestInput,
  QuoteRequestStatus,
  Category,
  Review,
  TokenPair,
  User,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore non-JSON error body
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function uploadFile(file: File, token: string): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/admin/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore non-JSON error body
    }
    throw new ApiError(res.status, detail);
  }
  return res.json();
}

function buildQuery(params: Record<string, unknown> | ProductFilters | MaterialFilters) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  products: {
    list: (filters: ProductFilters = {}) =>
      request<PaginatedProducts>(`/api/products${buildQuery(filters)}`),
    get: (slug: string) => request<Product>(`/api/products/${slug}`),
    recommendations: (slug: string, limit = 4) =>
      request<Product[]>(`/api/products/${slug}/recommendations${buildQuery({ limit })}`),
    adminList: (filters: { q?: string; page?: number; page_size?: number } = {}, token: string) =>
      request<PaginatedProducts>(`/api/products/admin/all${buildQuery(filters)}`, {}, token),
    adminGet: (id: string, token: string) => request<Product>(`/api/products/admin/${id}`, {}, token),
    create: (payload: ProductInput, token: string) =>
      request<Product>("/api/products", { method: "POST", body: JSON.stringify(payload) }, token),
    update: (id: string, payload: ProductUpdateInput, token: string) =>
      request<Product>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
    remove: (id: string, token: string) =>
      request<void>(`/api/products/${id}`, { method: "DELETE" }, token),
  },
  materials: {
    list: (filters: MaterialFilters = {}) =>
      request<PaginatedMaterials>(`/api/materials${buildQuery(filters)}`),
    get: (slug: string) => request<Material>(`/api/materials/${slug}`),
    adminList: (token: string) => request<Material[]>("/api/materials/admin/all", {}, token),
    create: (payload: MaterialInput, token: string) =>
      request<Material>("/api/materials", { method: "POST", body: JSON.stringify(payload) }, token),
    update: (id: string, payload: MaterialUpdateInput, token: string) =>
      request<Material>(`/api/materials/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
    remove: (id: string, token: string) =>
      request<void>(`/api/materials/${id}`, { method: "DELETE" }, token),
  },
  quoteRequests: {
    create: (payload: QuoteRequestInput) =>
      request<QuoteRequest>("/api/materials/quote-requests", { method: "POST", body: JSON.stringify(payload) }),
    adminList: (token: string) => request<QuoteRequest[]>("/api/materials/quote-requests", {}, token),
    updateStatus: (id: string, status: QuoteRequestStatus, token: string) =>
      request<QuoteRequest>(
        `/api/materials/quote-requests/${id}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token
      ),
  },
  categories: {
    list: () => request<Category[]>("/api/categories"),
    create: (payload: CategoryInput, token: string) =>
      request<Category>("/api/categories", { method: "POST", body: JSON.stringify(payload) }, token),
    update: (id: string, payload: Partial<CategoryInput>, token: string) =>
      request<Category>(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
    remove: (id: string, token: string) =>
      request<void>(`/api/categories/${id}`, { method: "DELETE" }, token),
  },
  coupons: {
    list: (token: string) => request<Coupon[]>("/api/coupons", {}, token),
    create: (payload: CouponInput, token: string) =>
      request<Coupon>("/api/coupons", { method: "POST", body: JSON.stringify(payload) }, token),
    update: (code: string, payload: CouponUpdateInput, token: string) =>
      request<Coupon>(`/api/coupons/${code}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
    remove: (code: string, token: string) =>
      request<void>(`/api/coupons/${code}`, { method: "DELETE" }, token),
  },
  admin: {
    stats: (token: string) => request<AdminStats>("/api/admin/stats", {}, token),
    revenueTrend: (token: string, days = 14) =>
      request<RevenueTrendPoint[]>(`/api/admin/stats/revenue-trend${buildQuery({ days })}`, {}, token),
    recentOrders: (token: string, limit = 5) =>
      request<RecentOrder[]>(`/api/admin/orders/recent${buildQuery({ limit })}`, {}, token),
    orders: {
      list: (token: string, status?: string) =>
        request<AdminOrder[]>(`/api/orders/admin/all${buildQuery({ status })}`, {}, token),
      updateStatus: (id: string, payload: { status: string; tracking_number?: string }, token: string) =>
        request<Order>(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }, token),
    },
    users: {
      list: (token: string, q?: string) => request<User[]>(`/api/admin/users${buildQuery({ q })}`, {}, token),
      updateRole: (id: string, role: "customer" | "admin", token: string) =>
        request<User>(`/api/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }, token),
      updateActive: (id: string, is_active: boolean, token: string) =>
        request<User>(`/api/admin/users/${id}/active`, { method: "PATCH", body: JSON.stringify({ is_active }) }, token),
      orders: (id: string, token: string) => request<Order[]>(`/api/admin/users/${id}/orders`, {}, token),
    },
    reviews: {
      list: (token: string) => request<AdminReview[]>("/api/admin/reviews", {}, token),
      remove: (id: string, token: string) => request<void>(`/api/admin/reviews/${id}`, { method: "DELETE" }, token),
    },
    upload: (file: File, token: string) => uploadFile(file, token),
  },
  auth: {
    signup: (payload: { email: string; password: string; full_name: string; phone?: string }) =>
      request<User>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
    login: (payload: { email: string; password: string }) =>
      request<TokenPair>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
    me: (token: string) => request<User>("/api/auth/me", {}, token),
  },
  addresses: {
    list: (token: string) => request<Address[]>("/api/addresses", {}, token),
    create: (payload: Omit<Address, "id">, token: string) =>
      request<Address>("/api/addresses", { method: "POST", body: JSON.stringify(payload) }, token),
  },
  cart: {
    addItem: (payload: { variant_id: string; quantity: number }, token: string) =>
      request("/api/cart/items", { method: "POST", body: JSON.stringify(payload) }, token),
  },
  orders: {
    checkout: (
      payload: { address_id: string; coupon_code?: string; payment_provider: "stripe" | "razorpay" },
      token: string
    ) => request<Order>("/api/orders/checkout", { method: "POST", body: JSON.stringify(payload) }, token),
    list: (token: string) => request<Order[]>("/api/orders", {}, token),
  },
  reviews: {
    listForProduct: (productId: string) => request<ProductReview[]>(`/api/reviews/product/${productId}`),
    create: (payload: { product_id: string; rating: number; title?: string; body?: string }, token: string) =>
      request<Review>("/api/reviews", { method: "POST", body: JSON.stringify(payload) }, token),
    remove: (id: string, token: string) => request<void>(`/api/reviews/${id}`, { method: "DELETE" }, token),
  },
};
