// Mirrors the server-side rules in the place_order database function.
// The server always recomputes totals; this is only for display.

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 49;
export const EXPRESS_SHIPPING_FEE = 99;

export type Delivery = "standard" | "express";
export type Coupon = { code: string; percent: number; max_discount: number; min_subtotal: number };

export function shippingFor(subtotal: number, delivery: Delivery): number {
  if (delivery === "express") return EXPRESS_SHIPPING_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function couponDiscount(subtotal: number, coupon: Coupon | null | undefined): number {
  if (!coupon || subtotal < coupon.min_subtotal) return 0;
  return Math.min(coupon.max_discount, Math.floor((subtotal * coupon.percent) / 100));
}

export function computeTotals(
  lines: { price: number; quantity: number; compare_at?: number | null }[],
  delivery: Delivery,
  coupon?: Coupon | null,
) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const mrp = lines.reduce((s, l) => s + (l.compare_at ?? l.price) * l.quantity, 0);
  const discount = couponDiscount(subtotal, coupon);
  const shipping = lines.length ? shippingFor(subtotal, delivery) : 0;
  return { subtotal, mrp, savings: mrp - subtotal + discount, discount, shipping, total: subtotal - discount + shipping };
}

export const inr = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const percentOff = (price: number, compare?: number | null) =>
  compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
