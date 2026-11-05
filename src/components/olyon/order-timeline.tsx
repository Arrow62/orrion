import { Check, X } from "lucide-react";
import { orderTimeline, STATUS_LABEL, type StatusEvent } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/shop";
import { cn } from "@/lib/utils";

export function OrderTimeline({ status, events, placedAt, compact = false }: {
  status: OrderStatus; events: StatusEvent[]; placedAt: string; compact?: boolean;
}) {
  const steps = orderTimeline(status, events, placedAt);
  return (
    <ol aria-label="Order status timeline" className={compact ? "mt-4 grid grid-cols-3 gap-x-3 gap-y-3 border-t border-border pt-3" : "relative"}>
      {steps.map((step, i) => (
        <li key={step.status} aria-current={step.current ? "step" : undefined}
          className={cn("relative flex min-w-0 gap-2", !compact && "pb-4 last:pb-0")}>
          {!compact && i < steps.length - 1 ? <span aria-hidden className={cn("absolute left-[9px] top-5 h-[calc(100%-0.5rem)] w-px", step.completed ? "bg-olive" : "bg-border")} /> : null}
          <span aria-hidden className={cn("relative grid size-5 shrink-0 place-items-center rounded-full border", step.status === "cancelled" ? "border-primary bg-primary/15 text-primary" : step.completed ? "border-olive bg-olive text-olive-foreground" : "border-border text-muted-foreground", step.current && "ring-2 ring-olive/25 ring-offset-2 ring-offset-background")}>
            {step.status === "cancelled" ? <X className="size-3" /> : step.completed ? <Check className="size-3" /> : <span className="size-1 rounded-full bg-muted-foreground/50" />}
          </span>
          <div className="min-w-0">
            <p className={cn(compact ? "text-[10px] leading-4" : "text-sm", step.completed ? "font-semibold" : "text-muted-foreground")}>{STATUS_LABEL[step.status]}</p>
            {step.at ? <time dateTime={step.at} className="block text-[9px] leading-4 text-muted-foreground">{new Date(step.at).toLocaleString("en-IN", { day: "numeric", month: "short", ...(!compact ? { hour: "numeric", minute: "2-digit" } as const : {}) })}</time> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}