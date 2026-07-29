"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/revenue-chart";

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: "default" | "warning";
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground/60">{label}</CardTitle>
        <Icon size={18} className={tone === "warning" ? "text-amber-500" : "text-foreground/40"} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.admin.stats(token),
  });
  const { data: trend } = useQuery({
    queryKey: ["admin", "revenue-trend"],
    queryFn: () => api.admin.revenueTrend(token, 14),
  });
  const { data: recentOrders, isLoading: recentLoading } = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: () => api.admin.recentOrders(token, 6),
  });

  return (
    <div>
      <h1 className="font-serif-display text-2xl">Dashboard</h1>
      <p className="mt-1 text-sm text-foreground/60">Overview of your store&apos;s activity.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Revenue" value={isLoading ? "…" : formatPrice(data?.total_revenue ?? 0)} icon={DollarSign} />
        <StatCard label="Total Orders" value={isLoading ? "…" : data?.total_orders ?? 0} icon={ShoppingCart} />
        <StatCard label="Pending Orders" value={isLoading ? "…" : data?.pending_orders ?? 0} icon={Clock} tone="warning" />
        <StatCard label="Total Products" value={isLoading ? "…" : data?.total_products ?? 0} icon={Package} />
        <StatCard label="Total Users" value={isLoading ? "…" : data?.total_users ?? 0} icon={Users} />
        <StatCard
          label="Low Stock Variants"
          value={isLoading ? "…" : data?.low_stock_variants ?? 0}
          icon={AlertTriangle}
          tone={data && data.low_stock_variants > 0 ? "warning" : "default"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue — last 14 days</CardTitle>
          </CardHeader>
          <CardContent>{trend && <RevenueChart data={trend} />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLoading && <p className="text-sm text-foreground/50">Loading…</p>}
            {!recentLoading && recentOrders?.length === 0 && (
              <p className="text-sm text-foreground/50">No orders yet.</p>
            )}
            {recentOrders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.user.full_name}</p>
                  <p className="text-xs text-foreground/50">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatPrice(order.grand_total)}</span>
                  <Badge variant={STATUS_TONE[order.status] ?? "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
