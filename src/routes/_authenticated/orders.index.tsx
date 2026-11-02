import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Package } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/olyon/chrome";
import { ForestPageHeader } from "@/components/olyon/decor";
import { EmptyState, Skel, btn } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/images";
import { inr } from "@/lib/pricing";
import { STATUS_LABEL } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — Orrion" },
      { name: "description", content: "Review your past Orrion purchases and track deliveries." },
      { property: "og:title", content: "My orders — Orrion" },
      { property: "og:description", content: "Your Orrion order history." },
    ],
  }),
  component: Orders,
});

const FILTERS = [
  { k: "all", t: "All" },
  { k: "active", t: "Active" },
  { k: "delivered", t: "Delivered" },
  { k: "cancelled", t: "Cancelled" },
] as const;

function Orders() {
  const [f, setF] = useState<(typeof FILTERS)[number]["k"]>("all");
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const list = (data ?? []).filter((o) =>
    f === "all" ? true : f === "active" ? !["delivered", "cancelled"].includes(o.status) : o.status === f);

  return (
    <div>
      <AppHeader back />
      <ForestPageHeader code="Order log" title="My Orders" sub={`${data?.length ?? 0} orders placed`} />
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((x) => (
          <button key={x.k} onClick={() => setF(x.k)} aria-pressed={f === x.k}
            className={cn("h-8 shrink-0 rounded-full border px-4 text-xs font-semibold transition",
              f === x.k ? "border-olive bg-olive text-olive-foreground" : "border-border text-muted-foreground")}>
            {x.t}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skel key={i} className="h-32" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={<Package className="size-6" />} title="No orders here" text="Orders you place will appear here."
          action={<Link to="/shop" className={btn()}>Start shopping</Link>} />
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const qty = o.order_items.reduce((s, i) => s + i.quantity, 0);
            return (
              <Link key={o.id} to="/orders/$id" params={{ id: o.id }} data-reveal
                className="surface block rounded-2xl p-4 transition hover:border-olive/40">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">#{o.order_number}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {o.order_items.slice(0, 3).map((i) => (
                      <img key={i.id} src={productImage(i.image)} alt="" width={48} height={48} loading="lazy" className="size-12 rounded-xl object-cover ring-2 ring-surface" />
                    ))}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {o.order_items[0]?.name}{o.order_items.length > 1 ? ` +${o.order_items.length - 1} more` : ""} · {qty} item{qty === 1 ? "" : "s"}
                  </p>
                  <span className="text-sm font-bold">{inr(o.total)}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: keyof typeof STATUS_LABEL }) {
  return (
    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
      status === "cancelled" ? "bg-primary/15 text-primary" : status === "delivered" ? "bg-olive text-olive-foreground" : "bg-secondary text-olive")}>
      {STATUS_LABEL[status]}
    </span>
  );
}
