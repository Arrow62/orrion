import type { OrderStatus } from "./shop";

export const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type StatusEvent = { status: OrderStatus; created_at: string };

export function orderTimeline(status: OrderStatus, events: StatusEvent[], placedAt: string) {
  const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const reached = STATUS_FLOW.indexOf(status);
  const lastBeforeCancellation = Math.max(0, ...sorted.map((e) => STATUS_FLOW.indexOf(e.status)));
  const flow = status === "cancelled" ? [...STATUS_FLOW.slice(0, lastBeforeCancellation + 1), "cancelled" as const] : STATUS_FLOW;
  return flow.map((step, index) => ({
    status: step,
    completed: status === "cancelled" || index <= reached,
    current: step === status,
    at: sorted.find((e) => e.status === step)?.created_at ?? (step === "pending" ? placedAt : undefined),
  }));
}
