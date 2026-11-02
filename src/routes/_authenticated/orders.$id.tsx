import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, MapPin, X } from "lucide-react";
import { AppHeader } from "@/components/olyon/chrome";
import { EmptyState, Skel, btn } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/images";
import { inr } from "@/lib/pricing";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import { StatusPill } from "./orders.index";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details — Orrion" },
      { name: "description", content: "Items, delivery status and payment for your Orrion order." },
      { property: "og:title", content: "Order details — Orrion" },
      { property: "og:description", content: "Your Orrion order details." },
    ],
  }),
  component: OrderDetail,
});

type Addr = { full_name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function OrderDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*), order_events(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div><AppHeader back /><Skel className="h-96" /></div>;
  if (!data) return <div><AppHeader back /><EmptyState icon={<X className="size-6" />} title="Order not found" text="This order doesn't exist or isn't yours." action={<Link to="/orders" className={btn()}>All orders</Link>} /></div>;

  const events = [...data.order_events].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const at = (s: string) => events.find((e) => e.status === s)?.created_at;
  const cancelled = data.status === "cancelled";
  const reached = STATUS_FLOW.indexOf(data.status);
  const a = (data.shipping_address ?? {}) as Addr;

  return (
    <div>
      <AppHeader back />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.25em] text-olive">Order</p>
          <h1 className="truncate text-2xl">#{data.order_number}</h1>
          <p className="text-xs text-muted-foreground">Placed {fmt(data.created_at)}</p>
        </div>
        <StatusPill status={data.status} />
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="space-y-4">
          <section className="surface rounded-2xl p-4">
            <h2 className="mb-3 text-sm font-semibold">Delivery status</h2>
            {cancelled ? (
              <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-3 text-sm">
                <X className="size-4 text-primary" /> Cancelled {at("cancelled") ? `on ${fmt(at("cancelled")!)}` : ""}
              </div>
            ) : (
              <ol className="relative">
                {STATUS_FLOW.map((s, i) => {
                  const done = i <= reached;
                  const when = at(s);
                  return (
                    <li key={s} className="relative flex gap-3 pb-4 last:pb-0">
                      {i < STATUS_FLOW.length - 1 ? <span className={cn("absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px", i < reached ? "bg-olive" : "bg-border")} /> : null}
                      <span className={cn("relative grid size-6 shrink-0 place-items-center rounded-full border", done ? "border-olive bg-olive text-olive-foreground" : "border-border")}>
                        {done ? <Check className="size-3.5" /> : null}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className={cn("text-sm", done ? "font-semibold" : "text-muted-foreground")}>{STATUS_LABEL[s]}</p>
                        {when ? <p className="text-[11px] text-muted-foreground">{fmt(when)}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="surface rounded-2xl p-4">
            <h2 className="mb-3 text-sm font-semibold">Items</h2>
            <div className="space-y-3">
              {data.order_items.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <img src={productImage(i.image)} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.color ? `${i.color} · ` : ""}Qty {i.quantity} × {inr(i.unit_price)}</p>
                  </div>
                  <span className="text-sm font-semibold">{inr(i.unit_price * i.quantity)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 space-y-4 lg:mt-0">
          <section className="surface rounded-2xl p-4 text-sm">
            <h2 className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="size-4 text-olive" /> Shipping to</h2>
            <p className="font-medium">{a.full_name}</p>
            <p className="text-muted-foreground">{[a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(", ")}</p>
            {a.phone ? <p className="text-muted-foreground">{a.phone}</p> : null}
          </section>
          <section className="surface space-y-1.5 rounded-2xl p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(data.subtotal)}</span></div>
            {data.discount ? <div className="flex justify-between text-olive"><span>Discount{data.coupon ? ` (${data.coupon})` : ""}</span><span>− {inr(data.discount)}</span></div> : null}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{data.shipping ? inr(data.shipping) : "FREE"}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{inr(data.total)}</span></div>
            <p className="pt-1 text-xs text-muted-foreground">Payment: {data.payment_method === "cod" ? "Cash on Delivery" : data.payment_method}</p>
          </section>
          <Link to="/orders" className={btn({ variant: "outline", className: "w-full" })}>Back to all orders</Link>
        </div>
      </div>
    </div>
  );
}
