"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyForm = { name: "", phone: "", email: "", message: "" };

export function RequestSampleDialog({
  materialId,
  materialName,
  open,
  onOpenChange,
}: {
  materialId: string;
  materialName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(emptyForm);

  const mutation = useMutation({
    mutationFn: () =>
      api.quoteRequests.create({
        material_id: materialId,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        message: form.message || undefined,
      }),
    onSuccess: () => {
      toast.success("Request sent! Our team will reach out shortly.");
      setForm(emptyForm);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't send your request"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Sample / Get a Quote</DialogTitle>
        </DialogHeader>
        <p className="-mt-2 text-sm text-foreground/60">For {materialName}</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Message (optional)</Label>
            <Textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us about your project or what you'd like to know…"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending…" : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
