"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut, Package } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Order } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  paid: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-600/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
  refunded: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function LoginPanel() {
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await api.auth.signup({ email: form.email, password: form.password, full_name: form.full_name });
      }
      const tokens = await api.auth.login({ email: form.email, password: form.password });
      const user = await api.auth.me(tokens.access_token);
      setSession(tokens.access_token, user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-border-subtle bg-surface p-6">
      <div className="mb-5 flex gap-6 border-b border-border-subtle">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn("relative pb-3 text-sm font-medium", mode === m ? "text-foreground" : "text-foreground/45")}
          >
            {m === "login" ? "Log In" : "Create Account"}
            {mode === m && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-walnut" />}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <input
            required
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
          />
        )}
        <input
          required
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-walnut py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {mode === "login" ? "Log In" : "Create Account"}
        </button>
      </form>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-foreground/50">Order #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-foreground/50">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", STATUS_TONE[order.status] ?? "bg-foreground/10")}>
          {order.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 border-t border-border-subtle pt-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground/80">
              {item.product_name}
              {item.variant_label ? ` (${item.variant_label})` : ""} × {item.quantity}
            </span>
            <span className="text-foreground/60">{formatPrice(item.unit_price)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        {order.tracking_number ? (
          <p className="text-xs text-foreground/50">Tracking: {order.tracking_number}</p>
        ) : (
          <span />
        )}
        <p className="font-serif-display text-lg">{formatPrice(order.grand_total)}</p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { accessToken, user, hasHydrated, logout } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => api.orders.list(accessToken as string),
    enabled: !!accessToken,
  });

  if (!hasHydrated) return null;

  if (!accessToken) {
    return (
      <div className="container-page py-14 md:py-20">
        <h1 className="mb-8 text-center font-serif-display text-3xl md:text-4xl">My Account</h1>
        <LoginPanel />
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl md:text-4xl">My Account</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {user?.full_name} · {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-sm hover:bg-surface-muted"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      <h2 className="mt-10 mb-4 font-serif-display text-xl">Order History</h2>

      {isLoading && <p className="text-foreground/50">Loading orders…</p>}

      {!isLoading && orders?.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-surface p-16 text-center">
          <Package size={28} className="text-foreground/30" />
          <p className="text-foreground/60">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="rounded-full bg-walnut px-6 py-2.5 text-sm text-white">
            Start Shopping
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders?.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
