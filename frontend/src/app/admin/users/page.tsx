"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { formatPrice } from "@/lib/utils";
import type { User } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

export default function AdminUsersPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => api.admin.users.list(token, search || undefined),
  });

  const { data: userOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin", "user-orders", viewingUser?.id],
    queryFn: () => api.admin.users.orders(viewingUser!.id, token),
    enabled: !!viewingUser,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "customer" | "admin" }) =>
      api.admin.users.updateRole(id, role, token),
    onSuccess: () => {
      toast.success("Role updated");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update role"),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.admin.users.updateActive(id, is_active, token),
    onSuccess: () => {
      toast.success("User updated");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update user"),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl">Users</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage customer and admin accounts.</p>
        </div>
        <Input
          placeholder="Search by name or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="mt-6 rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Orders</TableHead>
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
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell className="text-foreground/60">{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(role) =>
                      roleMutation.mutate({ id: user.id, role: role as "customer" | "admin" })
                    }
                    disabled={user.id === currentUser?.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {user.id === currentUser?.id ? (
                    <Badge variant="secondary">You</Badge>
                  ) : (
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={(checked) => activeMutation.mutate({ id: user.id, is_active: checked })}
                    />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => setViewingUser(user)}>
                    <Eye size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-foreground/50">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{viewingUser?.full_name}&apos;s Orders</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
            {ordersLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-foreground/40" size={24} />
              </div>
            )}
            {!ordersLoading && userOrders?.length === 0 && (
              <p className="py-10 text-center text-sm text-foreground/50">No orders yet.</p>
            )}
            {userOrders?.map((order) => (
              <div key={order.id} className="rounded-lg border border-border-subtle p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-foreground/60">{order.id.slice(0, 8)}</span>
                  <Badge variant={STATUS_TONE[order.status] ?? "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-foreground/60">{new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="font-semibold">{formatPrice(order.grand_total)}</span>
                </div>
                <p className="mt-1 text-xs text-foreground/50">{order.items.length} item(s)</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
