"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await api.auth.login(form);
      const user = await api.auth.me(tokens.access_token);
      if (user.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }
      setSession(tokens.access_token, user);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm rounded-xl border border-border-subtle bg-surface p-8 shadow-sm">
        <h1 className="font-serif-display text-2xl">Admin Login</h1>
        <p className="mt-1 text-sm text-foreground/60">Sign in to manage Maison.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
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
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
