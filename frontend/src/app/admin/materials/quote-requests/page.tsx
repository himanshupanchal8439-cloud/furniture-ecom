"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { QuoteRequestStatus } from "@/lib/types";

export default function AdminMaterialQuoteRequestsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin", "material-quote-requests"],
    queryFn: () => api.quoteRequests.adminList(token),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteRequestStatus }) =>
      api.quoteRequests.updateStatus(id, status, token),
    onSuccess: () => {
      toast.success("Marked as contacted");
      queryClient.invalidateQueries({ queryKey: ["admin", "material-quote-requests"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update"),
  });

  return (
    <div>
      <Link href="/admin/materials" className="mb-2 flex items-center gap-1.5 text-sm text-foreground/60 hover:text-walnut">
        <ArrowLeft size={14} /> Back to Materials
      </Link>
      <h1 className="font-serif-display text-2xl">Sample &amp; Quote Requests</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Requests submitted from the Wood &amp; Ply Design Catalogue.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
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
            {requests?.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.name}</TableCell>
                <TableCell className="text-foreground/60">{req.phone}</TableCell>
                <TableCell className="text-foreground/60">{req.email || "—"}</TableCell>
                <TableCell className="max-w-xs truncate text-foreground/60">{req.message || "—"}</TableCell>
                <TableCell>
                  <Badge variant={req.status === "new" ? "default" : "secondary"} className="capitalize">
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {req.status === "new" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: req.id, status: "contacted" })}
                    >
                      Mark Contacted
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && requests?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-foreground/50">
                  No requests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
