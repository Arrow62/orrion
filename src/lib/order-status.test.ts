import { describe, expect, it } from "vitest";
import { orderTimeline } from "./order-status";

describe("order progress", () => {
  it("follows placement through delivery in order", () => {
    expect(orderTimeline("pending", [], "2026-11-05T10:00:00Z").map((s) => s.status)).toEqual([
      "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered",
    ]);
  });
  it("does not mark future stages complete", () => {
    const steps = orderTimeline("shipped", [{ status: "shipped", created_at: "2026-11-06T10:00:00Z" }], "2026-11-05T10:00:00Z");
    expect(steps.filter((s) => s.completed).map((s) => s.status)).toEqual(["pending", "confirmed", "packed", "shipped"]);
    expect(steps.find((s) => s.current)?.at).toBe("2026-11-06T10:00:00Z");
  });
  it("ends cancelled orders at cancellation without suggesting delivery", () => {
    expect(orderTimeline("cancelled", [{ status: "confirmed", created_at: "2026-11-05T11:00:00Z" }], "2026-11-05T10:00:00Z").map((s) => s.status)).toEqual(["pending", "confirmed", "cancelled"]);
  });
});