"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import type { Address, Order } from "@/lib/types";

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FLAT = 49;

function AuthPanel() {
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
    <div className="rounded-xl border border-border-subtle bg-surface p-6">
      <div className="mb-5 flex gap-6 border-b border-border-subtle">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "relative pb-3 text-sm font-medium",
              mode === m ? "text-foreground" : "text-foreground/45"
            )}
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
          {mode === "login" ? "Log In" : "Create Account & Continue"}
        </button>
      </form>
    </div>
  );
}

function AddressForm({ onCreated }: { onCreated: (address: Address) => void }) {
  const token = useAuthStore((s) => s.accessToken)!;
  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const address = await api.addresses.create({ ...form, is_default: true }, token);
      onCreated(address);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Address line 1"
          value={form.line1}
          onChange={(e) => setForm({ ...form, line1: e.target.value })}
          className="col-span-2 rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <input
          placeholder="Address line 2 (optional)"
          value={form.line2}
          onChange={(e) => setForm({ ...form, line2: e.target.value })}
          className="col-span-2 rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <input
          required
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <input
          required
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <input
          required
          placeholder="Postal code"
          value={form.postal_code}
          onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
          className="rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <input
          required
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="rounded-md border border-border-subtle bg-transparent px-3 py-2.5 text-sm outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border border-walnut py-2.5 text-sm font-medium text-walnut disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save Address"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const couponParam = searchParams.get("coupon") ?? undefined;
  const { accessToken, user } = useAuthStore();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "razorpay">("stripe");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.addresses.list(accessToken as string),
    enabled: !!accessToken,
  });

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    if (!accessToken || !selectedAddressId) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      for (const line of lines) {
        await api.cart.addItem({ variant_id: line.variantId, quantity: line.quantity }, accessToken);
      }
      const created = await api.orders.checkout(
        { address_id: selectedAddressId, coupon_code: couponParam, payment_provider: paymentProvider },
        accessToken
      );
      setOrder(created);
      clearCart();
    } catch (err) {
      setPlaceError(err instanceof ApiError ? err.message : "Could not place order. Is the backend running?");
    } finally {
      setPlacing(false);
    }
  };

  if (order) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <CheckCircle2 size={40} className="text-walnut" />
        <h1 className="font-serif-display text-3xl">Order Confirmed</h1>
        <p className="max-w-md text-sm text-foreground/60">
          Thank you, {user?.full_name}. Your order <span className="font-medium">#{order.id.slice(0, 8)}</span> for{" "}
          {formatPrice(order.grand_total)} has been placed and is being processed.
        </p>
        <Link href="/products" className="mt-2 rounded-full bg-walnut px-6 py-2.5 text-sm text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-foreground/60">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block rounded-full bg-walnut px-6 py-2.5 text-sm text-white">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-serif-display text-3xl md:text-4xl">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 font-serif-display text-xl">1. Contact</h2>
            {accessToken ? (
              <div className="rounded-xl border border-border-subtle bg-surface p-4 text-sm">
                Logged in as <span className="font-medium">{user?.email}</span>
              </div>
            ) : (
              <AuthPanel />
            )}
          </section>

          {accessToken && (
            <section>
              <h2 className="mb-4 font-serif-display text-xl">2. Shipping Address</h2>
              <div className="space-y-3">
                {addresses?.map((addr) => (
                  <label
                    key={addr.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm",
                      selectedAddressId === addr.id ? "border-walnut" : "border-border-subtle"
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{addr.label}</p>
                      <p className="text-foreground/60">
                        {addr.line1}, {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}

                {!showNewAddress ? (
                  <button
                    onClick={() => setShowNewAddress(true)}
                    className="text-sm font-medium text-walnut underline underline-offset-4"
                  >
                    + Add a new address
                  </button>
                ) : (
                  <div className="rounded-xl border border-border-subtle p-4">
                    <AddressForm
                      onCreated={(addr) => {
                        queryClient.setQueryData<Address[]>(["addresses"], (prev) => [...(prev ?? []), addr]);
                        setSelectedAddressId(addr.id);
                        setShowNewAddress(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {accessToken && (
            <section>
              <h2 className="mb-4 font-serif-display text-xl">3. Payment</h2>
              <div className="space-y-3">
                {(["stripe", "razorpay"] as const).map((p) => (
                  <label
                    key={p}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm capitalize",
                      paymentProvider === p ? "border-walnut" : "border-border-subtle"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentProvider === p}
                      onChange={() => setPaymentProvider(p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="h-fit rounded-xl border border-border-subtle bg-surface p-6">
          <h2 className="font-serif-display text-xl">Order Summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.variantId} className="flex justify-between text-foreground/70">
                <span>
                  {l.productName} × {l.quantity}
                </span>
                <span>{formatPrice(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-border-subtle pt-4 text-sm">
            <div className="flex justify-between text-foreground/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border-subtle pt-2 font-serif-display text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {placeError && <p className="mt-3 text-sm text-red-500">{placeError}</p>}

          <button
            onClick={placeOrder}
            disabled={!accessToken || !selectedAddressId || placing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-walnut py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {placing && <Loader2 size={14} className="animate-spin" />}
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
