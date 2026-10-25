import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Home } from "lucide-react";
import { Logo } from "@/components/olyon/chrome";
import { Skel, btn } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/images";
import { inr } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/order-success/$id")({
  head: () => ({
    meta: [
      { title: "Order placed — Orrion" },
      { name: "description", content: "Your Orrion order has been placed." },
      { property: "og:title", content: "Order placed — Orrion" },
      { property: "og:description", content: "Your Orrion order has been placed." },
    ],
  }),
  component: Success,
});

function Success() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("id", id).single()).data,
  });
  return (
    <div className="mx-auto max-w-lg py-6 text-center">
      <Logo />
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="mx-auto mt-10 grid size-24 place-items-center rounded-full bg-olive text-olive-foreground shadow-lift">
        <Check className="size-12" strokeWidth={2.5} />
      </motion.div>
      <h1 className="mt-6 text-4xl">Order Successful!</h1>
      <p className="mt-2 text-muted-foreground">Pay in cash when your order arrives.</p>
      {!data ? <Skel className="mt-6 h-60" /> : (
        <>
          <p className="surface mx-auto mt-5 inline-block rounded-full px-5 py-2.5 font-semibold">Order #{data.order_number}</p>
          <div className="surface mt-5 rounded-3xl p-5 text-left text-sm">
            {data.order_items.map((i) => (
              <div key={i.id} className="mb-3 flex items-center gap-3">
                <img src={productImage(i.image)} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />
                <span className="flex-1"><strong className="block">{i.name}</strong><span className="text-muted-foreground">{i.color} · Qty {i.quantity}</span></span>
                <span>{inr(i.unit_price * i.quantity)}</span>
              </div>
            ))}
            <div className="space-y-1.5 border-t border-border pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(data.subtotal)}</span></div>
              {data.discount ? <div className="flex justify-between text-success"><span>Discount</span><span>- {inr(data.discount)}</span></div> : null}
              <div className="flex justify-between"><span>Shipping</span><span>{data.shipping ? inr(data.shipping) : "FREE"}</span></div>
              <div className="flex justify-between pt-2 text-lg font-bold"><span>Total (COD)</span><span>{inr(data.total)}</span></div>
            </div>
          </div>
        </>
      )}
      <Link to="/" className={btn({ size: "lg", className: "mt-6 w-full" })}><Home className="size-4" /> Continue Shopping</Link>
    </div>
  );
}
