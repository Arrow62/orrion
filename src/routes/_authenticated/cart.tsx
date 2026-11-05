import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NightCta, NightFooter, NightHero } from "@/components/olyon/night";
import { EmptyState, Skel, btn } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/images";
import { computeTotals, inr, percentOff, type Coupon } from "@/lib/pricing";
import { colorsOf, useCart, useUpdateCartQty } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Orrion" },
      { name: "description", content: "Review the items in your Orrion cart." },
      { property: "og:title", content: "Your cart — Orrion" },
      { property: "og:description", content: "Review your Orrion cart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { data: items, isLoading } = useCart();
  const update = useUpdateCartQty();
  const [couponOpen, setCouponOpen] = useState(false);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const coupons = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*")).data ?? [],
  });

  const lines = (items ?? []).map((i) => ({ price: i.product.price, compare_at: i.product.compare_at, quantity: i.quantity }));
  const t = computeTotals(lines, "standard", coupon);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const savings = t.mrp - t.subtotal + t.discount;

  const apply = (c?: string) => {
    const want = (c ?? code).trim().toUpperCase();
    const found = coupons.data?.find((x) => x.code === want);
    if (!found) { toast.error("That coupon code isn't valid"); return; }
    if (t.subtotal < found.min_subtotal) { toast.error(`Add ${inr(found.min_subtotal - t.subtotal)} more to use ${found.code}`); return; }
    setCoupon(found);
    setCouponOpen(false);
    toast.success(`${found.code} applied`);
  };

  return (
    <div>
      <NightHero eyebrow="Your cart" title="Your Cart" sub={`${count} item${count === 1 ? "" : "s"} in your cart`} />

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skel key={i} className="h-32" />)}</div>
      ) : !items?.length ? (
        <EmptyState icon={<ShoppingBag className="size-7" />} title="Your cart is empty" text="Discover something wonderful and it will wait for you here."
          action={<Link to="/shop" className={btn()}>Explore products <ArrowRight className="size-4" /></Link>} />
      ) : (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <ul>
            <AnimatePresence initial={false}>
              {items.map((i) => {
                const off = percentOff(i.product.price, i.product.compare_at);
                const hex = colorsOf(i.product).find((c) => c.name === i.color)?.hex;
                return (
                  <motion.li key={i.id} layout exit={{ opacity: 0, x: -40, height: 0 }} transition={{ duration: 0.25 }}
                    className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 overflow-hidden border-b border-foreground/10 py-4 first:pt-0 sm:grid-cols-[8rem_minmax(0,1fr)]">
                    <Link to="/product/$slug" params={{ slug: i.product.slug }} className="block aspect-square overflow-hidden rounded-2xl">
                      <img src={productImage(i.product.image)} alt={i.product.name} loading="lazy" width={240} height={240} className="size-full object-cover" />
                    </Link>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-[1.15rem] text-foreground">{i.product.name}</h3>
                          <p className="truncate text-[0.8rem] text-foreground/60">{i.product.tagline}</p>
                        </div>
                        <button onClick={() => update.mutate({ id: i.id, quantity: 0 })} aria-label={`Remove ${i.product.name}`}
                          className="grid size-9 shrink-0 place-items-center rounded-full text-foreground/80 hover:text-destructive">
                          <Trash2 className="size-[18px]" strokeWidth={1.6} />
                        </button>
                      </div>
                      {i.color ? (
                        <p className="mt-1.5 flex items-center gap-2 text-[0.8rem] text-foreground/85">
                          <span className="size-4 rounded-full border border-foreground/40" style={hex ? { background: hex } : undefined} />{i.color}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xl text-lime">{inr(i.product.price)}</span>
                          {i.product.compare_at ? <span className="font-display text-[0.8rem] text-foreground/50 line-through">{inr(i.product.compare_at)}</span> : null}
                          {off ? <span className="rounded-full bg-plum-soft px-2 py-0.5 text-[10px] font-semibold text-foreground">{off}% OFF</span> : null}
                        </div>
                        <div className="flex h-9 items-center rounded-full border border-foreground/30">
                          <button aria-label="Decrease quantity" disabled={i.quantity <= 1} onClick={() => update.mutate({ id: i.id, quantity: i.quantity - 1 })}
                            className="grid size-9 place-items-center disabled:opacity-40"><Minus className="size-3.5" /></button>
                          <span className="w-5 text-center text-sm" aria-live="polite">{i.quantity}</span>
                          <button aria-label="Increase quantity" disabled={i.quantity >= Math.min(i.product.stock, 20)} onClick={() => update.mutate({ id: i.id, quantity: i.quantity + 1 })}
                            className="grid size-9 place-items-center disabled:opacity-40"><Plus className="size-3.5" /></button>
                        </div>
                      </div>
                      {i.quantity > i.product.stock ? <p className="mt-1 text-xs text-destructive">Only {i.product.stock} in stock</p> : null}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="mt-2 lg:mt-0">
            {/* Coupon */}
            <div className="relative overflow-hidden border-y border-foreground/10 py-4">
              <svg viewBox="0 0 300 80" className="pointer-events-none absolute -right-4 bottom-0 h-full w-2/3 text-olive opacity-50" aria-hidden>
                <path d="M20 78 C120 70 200 30 290 4 C230 40 170 70 20 78Z" fill="currentColor" opacity=".35" />
                <path d="M20 78 C120 66 210 34 290 4" stroke="var(--lime)" strokeWidth="1" fill="none" opacity=".6" />
              </svg>
              {coupon ? (
                <div className="relative flex items-center gap-4">
                  <CouponIcon />
                   <div className="min-w-0 flex-1"><p className="font-display text-base italic">{coupon.code} applied</p><p className="text-xs text-foreground/70">You save {inr(t.discount)}</p></div>
                  <button onClick={() => setCoupon(null)} aria-label="Remove coupon" className="grid size-9 place-items-center"><X className="size-5" /></button>
                </div>
              ) : (
                <>
                  <button onClick={() => setCouponOpen((o) => !o)} className="relative flex w-full items-center gap-4 text-left" aria-expanded={couponOpen}>
                    <CouponIcon />
                     <span className="min-w-0 flex-1"><span className="block font-display text-base italic">Apply Coupon Code</span><span className="text-xs text-foreground/70">Get extra discounts on your order</span></span>
                    <ArrowRight className={`size-5 text-lime transition-transform ${couponOpen ? "rotate-90" : ""}`} />
                  </button>
                  {couponOpen ? (
                    <div className="relative mt-4">
                      <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="flex gap-2">
                        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" aria-label="Coupon code"
                          className="h-11 min-w-0 flex-1 rounded-full border border-foreground/25 bg-transparent px-4 uppercase outline-none focus:border-lime" />
                        <button type="submit" className="h-11 rounded-full bg-olive px-5 text-sm font-semibold text-olive-foreground">Apply</button>
                      </form>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(coupons.data ?? []).map((c) => (
                          <button key={c.code} onClick={() => apply(c.code)} className="rounded-full border border-dashed border-lime/50 px-3 py-1.5 text-xs">
                            <strong>{c.code}</strong> · {c.percent}% off above {inr(c.min_subtotal)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 py-4 text-sm">
              <Row l={`Subtotal (${count} item${count === 1 ? "" : "s"})`} r={inr(t.mrp)} />
              {savings > 0 ? <Row l="Discount" r={`- ${inr(savings)}`} lime /> : null}
              <Row l="Shipping" r={t.shipping ? inr(t.shipping) : "FREE"} lime={!t.shipping} />
              <div className="!mt-4 flex items-center justify-between border-t border-foreground/15 pt-4">
                <span className="font-display text-lg">Total Amount</span>
                <span className="font-display text-xl">{inr(t.total)}</span>
              </div>
            </div>
            <NightCta className="w-full" onClick={() => navigate({ to: "/checkout", search: { coupon: coupon?.code } })}>
               <ShoppingBag className="size-4" strokeWidth={1.4} /> Proceed to Checkout <ArrowRight className="size-4" strokeWidth={1.4} />
            </NightCta>
          </div>
        </div>
      )}
      <NightFooter />
    </div>
  );
}

function CouponIcon() {
  return (
     <span className="grid size-9 shrink-0 -rotate-12 place-items-center rounded-lg border border-lime text-base font-bold text-lime">%</span>
  );
}

function Row({ l, r, lime }: { l: string; r: string; lime?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/90">{l}</span>
      <span className={lime ? "text-lime" : "text-foreground"}>{r}</span>
    </div>
  );
}
