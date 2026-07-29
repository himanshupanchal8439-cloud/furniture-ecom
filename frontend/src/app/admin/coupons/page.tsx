"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Coupon, CouponInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const emptyForm: CouponInput = { code: "", percent_off: undefined, amount_off: undefined, max_redemptions: undefined };

export default function AdminCouponsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => api.coupons.list(token),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });

  const createMutation = useMutation({
    mutationFn: (payload: CouponInput) => api.coupons.create(payload, token),
    onSuccess: () => {
      toast.success("Coupon created");
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to create coupon"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ code, is_active }: { code: string; is_active: boolean }) =>
      api.coupons.update(code, { is_active }, token),
    onSuccess: () => {
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update coupon"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CouponInput) =>
      api.coupons.update(
        editing!.code,
        {
          percent_off: payload.percent_off ?? null,
          amount_off: payload.amount_off ?? null,
          max_redemptions: payload.max_redemptions ?? null,
        },
        token
      ),
    onSuccess: () => {
      toast.success("Coupon updated");
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update coupon"),
  });

  const deleteMutation = useMutation({
    mutationFn: (code: string) => api.coupons.remove(code, token),
    onSuccess: () => {
      toast.success("Coupon deleted");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete coupon"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      percent_off: coupon.percent_off ?? undefined,
      amount_off: coupon.amount_off ?? undefined,
      max_redemptions: coupon.max_redemptions ?? undefined,
    });
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate(form);
    else createMutation.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl">Coupons</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage discount codes.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New Coupon
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-foreground/50">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {coupons?.map((coupon) => (
              <TableRow key={coupon.code}>
                <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                <TableCell>
                  {coupon.percent_off ? (
                    <Badge variant="secondary">{coupon.percent_off}% off</Badge>
                  ) : (
                    <Badge variant="secondary">₹{coupon.amount_off} off</Badge>
                  )}
                </TableCell>
                <TableCell className="text-foreground/60">
                  {coupon.times_redeemed}
                  {coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ""}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={(checked) => toggleMutation.mutate({ code: coupon.code, is_active: checked })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(coupon)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(coupon)}>
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && coupons?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-foreground/50">
                  No coupons yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.code}` : "New Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                required
                disabled={!!editing}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Percent Off (%)</Label>
              <Input
                type="number"
                value={form.percent_off ?? ""}
                onChange={(e) =>
                  setForm({ ...form, percent_off: e.target.value ? Number(e.target.value) : undefined, amount_off: undefined })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount Off (₹)</Label>
              <Input
                type="number"
                value={form.amount_off ?? ""}
                onChange={(e) =>
                  setForm({ ...form, amount_off: e.target.value ? Number(e.target.value) : undefined, percent_off: undefined })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max Redemptions (optional)</Label>
              <Input
                type="number"
                value={form.max_redemptions ?? ""}
                onChange={(e) =>
                  setForm({ ...form, max_redemptions: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.code}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>This coupon will no longer be redeemable.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.code)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
