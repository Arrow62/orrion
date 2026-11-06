import { expect, it } from "vitest";
import { supplierInrPrice, supplierInitialStock } from "./supplier-pricing";

it("converts supplier prices to whole INR without markup", () => {
  expect(supplierInrPrice(1.4, 85)).toBe(119);
});
it("keeps imported products unavailable until inventory is confirmed", () => {
  expect(supplierInitialStock()).toBe(0);
});