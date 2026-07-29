"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/utils";
import type { AdminOrder } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

export default function AdminOrdersPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<AdminOrder | null>(null);
  const [form, setForm] = useState({ status: "", tracking_number: "" });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders", statusFilter],
    queryFn: () => api.admin.orders.list(token, statusFilter === "all" ? undefined : statusFilter),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.admin.orders.updateStatus(viewing!.id, { status: form.status, tracking_number: form.tracking_number || undefined }, token),
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setViewing(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update order"),
  });

  const openView = (order: AdminOrder) => {
    setViewing(order);
    setForm({ status: order.status, tracking_number: order.tracking_number ?? "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl">Orders</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage customer orders and fulfillment.</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-foreground/50">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {orders?.map((order) => (
              <TableRow key={order.id} className="cursor-pointer" onClick={() => openView(order)}>
                <TableCell className="font-mono text-xs text-foreground/60">{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.user.full_name}</div>
                  <div className="text-xs text-foreground/50">{order.user.email}</div>
                </TableCell>
                <TableCell className="text-foreground/60">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatPrice(order.grand_total)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_TONE[order.status] ?? "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openView(order); }}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && orders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-foreground/50">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{viewing?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>

          {viewing && (
            <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Customer</p>
                <p className="text-sm font-medium">{viewing.user.full_name}</p>
                <p className="text-sm text-foreground/60">{viewing.user.email}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Shipping Address</p>
                <p className="text-sm text-foreground/80">
                  {viewing.address.line1}
                  {viewing.address.line2 ? `, ${viewing.address.line2}` : ""}
                  <br />
                  {viewing.address.city}, {viewing.address.state} {viewing.address.postal_code}
                  <br />
                  {viewing.address.country}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Items</p>
                <div className="mt-1 space-y-2">
                  {viewing.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product_name}
                        {item.variant_label ? ` (${item.variant_label})` : ""} × {item.quantity}
                      </span>
                      <span className="text-foreground/70">{formatPrice(item.unit_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Subtotal</span>
                  <span>{formatPrice(viewing.subtotal)}</span>
                </div>
                {Number(viewing.discount_total) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Discount {viewing.coupon_code ? `(${viewing.coupon_code})` : ""}</span>
                    <span>-{formatPrice(viewing.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-foreground/60">Shipping</span>
                  <span>{formatPrice(viewing.shipping_total)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(viewing.grand_total)}</span>
                </div>
              </div>

              {viewing.payment_reference && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Payment</p>
                  <p className="text-sm text-foreground/80 capitalize">
                    {viewing.payment_provider} · <span className="font-mono">{viewing.payment_reference}</span>
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(status) => setForm({ ...form, status: status ?? form.status })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tracking Number</Label>
                <Input
                  value={form.tracking_number}
                  onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
