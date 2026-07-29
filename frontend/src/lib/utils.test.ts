import { describe, expect, it } from "vitest";
import { cn, deriveDeal, formatPrice } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats a numeric price as INR currency", () => {
    expect(formatPrice(1000)).toBe("₹1,000");
  });

  it("formats a string price as INR currency", () => {
    expect(formatPrice("2500.00")).toBe("₹2,500");
  });

  it("rounds to whole rupees", () => {
    expect(formatPrice(199.6)).toBe("₹200");
  });
});

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("deriveDeal", () => {
  it("is deterministic for the same seed", () => {
    const a = deriveDeal(1000, "product-1");
    const b = deriveDeal(1000, "product-1");
    expect(a).toEqual(b);
  });

  it("produces a discount between 15% and 45%", () => {
    const { discountPct } = deriveDeal(1000, "product-2");
    expect(discountPct).toBeGreaterThanOrEqual(15);
    expect(discountPct).toBeLessThanOrEqual(45);
  });

  it("computes an MRP higher than the selling price", () => {
    const { mrp } = deriveDeal(1000, "product-3");
    expect(mrp).toBeGreaterThan(1000);
  });
});
