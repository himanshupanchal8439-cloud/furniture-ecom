"use client";

import { useState } from "react";
import { Truck } from "lucide-react";

function estimateRange(pincode: string) {
  const seed = pincode.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const startDays = 5 + (seed % 4);
  const endDays = startDays + 4;
  const fmt = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  return `${fmt(startDays)} – ${fmt(endDays)}`;
}

export function DeliveryEstimator() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-border-subtle p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Truck size={16} /> Estimate Delivery
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pincode.trim().length >= 4) setResult(estimateRange(pincode.trim()));
        }}
        className="flex gap-2"
      >
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Enter pincode"
          className="flex-1 rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button type="submit" className="rounded-md bg-walnut px-4 py-2 text-sm text-white">
          Check
        </button>
      </form>
      {result && (
        <p className="mt-3 text-sm text-foreground/70">
          Estimated delivery: <span className="font-medium text-foreground">{result}</span>
        </p>
      )}
    </div>
  );
}
