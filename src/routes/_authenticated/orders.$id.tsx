import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, X } from "lucide-react";
import { AppHeader } from "@/components/olyon/chrome";
import { EmptyState, Skel, btn } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/images";
import { inr } from "@/lib/pricing";
import { OrderTimeline } from "@/components/olyon/order-timeline";
import { StatusPill } from "./orders.index";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details — Orrion" },
      { name: "description", content: "Items, delivery status and payment for your Orrion order." },
      { property: "og:title", content: "Order details — Orrion" },
      { property: "og:description", content: "Your Orrion order details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*), order_events(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div><AppHeader back /><Skel className="h-96" /></div>;
  if (!data) return <div><AppHeader back /><EmptyState icon={<X className="size-6" />} title="Order not found" text="This order doesn't exist or isn't yours." action={<Link to="/orders" className={btn()}>All orders</Link>} /></div>;

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
            <OrderTimeline status={data.status} events={data.order_events} placedAt={data.created_at} />
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
