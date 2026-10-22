import { describe, expect, it } from "vitest";
import { computeTotals, couponDiscount, shippingFor } from "./pricing";

describe("pricing rules", () => {
  it("standard shipping is free at ₹999 and above", () => {
    expect(shippingFor(999, "standard")).toBe(0);
  });
  it("standard shipping costs ₹49 below ₹999", () => {
    expect(shippingFor(998, "standard")).toBe(49);
  });
  it("express delivery always costs ₹99", () => {
    expect(shippingFor(5000, "express")).toBe(99);
  });
  it("coupon discount is capped at its maximum", () => {
    expect(couponDiscount(10000, { code: "X", percent: 10, max_discount: 500, min_subtotal: 0 })).toBe(500);
  });
  it("coupon gives nothing below its minimum subtotal", () => {
    expect(couponDiscount(500, { code: "X", percent: 10, max_discount: 500, min_subtotal: 999 })).toBe(0);
  });
  it("total = subtotal - discount + shipping", () => {
    const t = computeTotals([{ price: 1499, quantity: 2 }], "standard", {
      code: "FOREST10", percent: 10, max_discount: 500, min_subtotal: 999,
    });
    expect(t.total).toBe(2998 - 299 + 0);
  });
});
