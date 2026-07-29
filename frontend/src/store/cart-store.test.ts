import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/store/cart-store";

const baseLine = {
  variantId: "variant-1",
  productSlug: "test-product",
  productName: "Test Product",
  image: null,
  color: "Black",
  material: null,
  size: null,
  unitPrice: 100,
  stockQuantity: 10,
};

beforeEach(() => {
  useCartStore.setState({ lines: [] });
});

describe("cart-store", () => {
  it("adds a new line item", () => {
    useCartStore.getState().addLine(baseLine, 2);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].quantity).toBe(2);
  });

  it("increments quantity when adding the same variant again", () => {
    useCartStore.getState().addLine(baseLine, 1);
    useCartStore.getState().addLine(baseLine, 3);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].quantity).toBe(4);
  });

  it("adds separate lines for different variants", () => {
    useCartStore.getState().addLine(baseLine, 1);
    useCartStore.getState().addLine({ ...baseLine, variantId: "variant-2" }, 1);
    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it("updateQuantity removes the line when quantity drops to zero", () => {
    useCartStore.getState().addLine(baseLine, 1);
    useCartStore.getState().updateQuantity("variant-1", 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("updateQuantity sets a positive quantity", () => {
    useCartStore.getState().addLine(baseLine, 1);
    useCartStore.getState().updateQuantity("variant-1", 5);
    expect(useCartStore.getState().lines[0].quantity).toBe(5);
  });

  it("removeLine removes only the targeted variant", () => {
    useCartStore.getState().addLine(baseLine, 1);
    useCartStore.getState().addLine({ ...baseLine, variantId: "variant-2" }, 1);
    useCartStore.getState().removeLine("variant-1");
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].variantId).toBe("variant-2");
  });

  it("clear empties the cart", () => {
    useCartStore.getState().addLine(baseLine, 1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});
