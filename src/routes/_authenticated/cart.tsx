import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Flame, Heart, Leaf, Lock, ArrowRight, ShoppingBag, Ticket, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppHeader, CartButton } from "@/components/olyon/chrome";
import { Btn, EmptyState, PageTitle, Pill, QtyStepper, Skel, btn, iconBtn } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/images";
import { computeTotals, inr, percentOff, type Coupon } from "@/lib/pricing";
import { useCart, useUpdateCartQty } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Olyon" },
      { name: "description", content: "Review the items in your Olyon cart." },
      { property: "og:title", content: "Your cart — Olyon" },
      { property: "og:description", content: "Review your Olyon cart." },
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
      <AppHeader right={<><Link to="/wishlist" className={iconBtn()} aria-label="Wishlist"><Heart className="size-5" /></Link><CartButton /></>} tagline="Viral products ✦ Better you" />
      <PageTitle title="Your Cart" sub={`${count} item${count === 1 ? "" : "s"} in your cart`}
        aside={<p className="hidden items-center gap-2 text-right text-sm text-olive sm:flex"><Leaf className="size-6" />Good things<br />are on the way</p>} />

      {isLoading ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skel key={i} className="h-40" />)}</div>
      ) : !items?.length ? (
        <EmptyState icon={<ShoppingBag className="size-7" />} title="Your cart is empty" text="Discover something wonderful and it will wait for you here."
          action={<Link to="/shop" className={btn()}>Explore products <ArrowRight className="size-4" /></Link>} />
      ) : (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((i) => {
                const off = percentOff(i.product.price, i.product.compare_at);
                return (
                  <motion.li key={i.id} layout exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }} transition={{ duration: 0.3 }}
                    className="surface grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 overflow-hidden rounded-3xl p-3">
                    <Link to="/product/$slug" params={{ slug: i.product.slug }} className="relative block aspect-square overflow-hidden rounded-2xl">
                      <img src={productImage(i.product.image)} alt={i.product.name} loading="lazy" width={240} height={240} className="size-full object-cover" />
                      {i.product.badge ? <span className="absolute left-2 top-2"><Pill tone="plum"><Flame className="size-3" />{i.product.badge}</Pill></span> : null}
                    </Link>
                    <div className="min-w-0 py-1 pr-1">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-sans text-base font-semibold">{i.product.name}</h3>
                          <p className="truncate text-xs text-muted-foreground">{i.product.tagline}</p>
                        </div>
                        <button onClick={() => update.mutate({ id: i.id, quantity: 0 })} aria-label={`Remove ${i.product.name}`} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive">
                          <Trash2 className="size-[18px]" />
                        </button>
                      </div>
                      {i.color ? <span className="mt-1.5 inline-flex rounded-full border border-border px-2 py-0.5 text-xs">{i.color}</span> : null}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="font-bold">{inr(i.product.price)}</span>
                        {i.product.compare_at ? <span className="text-xs text-muted-foreground line-through">{inr(i.product.compare_at)}</span> : null}
                        {off ? <Pill>{off}% OFF</Pill> : null}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <QtyStepper size="sm" value={i.quantity} max={Math.min(i.product.stock, 20)}
                          onChange={(v) => update.mutate({ id: i.id, quantity: v })} min={1} />
                        <span className="font-semibold">{inr(i.product.price * i.quantity)}</span>
                      </div>
                      {i.quantity > i.product.stock ? <p className="mt-1 text-xs text-destructive">Only {i.product.stock} in stock</p> : null}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="mt-4 space-y-4 lg:mt-0">
            {coupon ? (
              <div className="flex items-center gap-3 rounded-3xl border border-olive/30 bg-olive-soft p-4">
                <Ticket className="size-6 text-olive" />
                <div className="min-w-0 flex-1"><p className="font-semibold">{coupon.code} applied</p><p className="text-xs text-muted-foreground">You save {inr(t.discount)}</p></div>
                <button onClick={() => setCoupon(null)} aria-label="Remove coupon"><X className="size-5" /></button>
              </div>
            ) : (
              <div className="rounded-3xl bg-secondary p-4">
                <button onClick={() => setCouponOpen((o) => !o)} className="flex w-full items-center gap-3 text-left" aria-expanded={couponOpen}>
                  <span className="grid size-11 place-items-center rounded-2xl bg-olive text-olive-foreground"><Ticket className="size-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">Apply Coupon Code</span><span className="text-xs text-muted-foreground">Get extra discounts on your order</span></span>
                  <ChevronRight className={`size-5 transition-transform ${couponOpen ? "rotate-90" : ""}`} />
                </button>
                {couponOpen ? (
                  <div className="mt-4">
                    <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="flex gap-2">
                      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" aria-label="Coupon code"
                        className="h-11 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 uppercase outline-none focus:border-olive" />
                      <Btn size="sm" className="h-11" type="submit">Apply</Btn>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(coupons.data ?? []).map((c) => (
                        <button key={c.code} onClick={() => apply(c.code)} className="rounded-full border border-dashed border-olive/50 px-3 py-1.5 text-xs">
                          <strong>{c.code}</strong> · {c.percent}% off above {inr(c.min_subtotal)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="surface space-y-3 rounded-3xl p-5 text-sm">
              <Row l={`Subtotal (${count} items)`} r={inr(t.subtotal)} />
              {t.mrp > t.subtotal ? <Row l="Product savings" r={`- ${inr(t.mrp - t.subtotal)}`} green /> : null}
              {t.discount ? <Row l="Coupon discount" r={`- ${inr(t.discount)}`} green /> : null}
              <Row l="Shipping" r={t.shipping ? inr(t.shipping) : "FREE"} green={!t.shipping} />
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-base font-semibold">Total Amount</span>
                <span className="text-2xl font-bold">{inr(t.total)}</span>
              </div>
            </div>
            <Btn size="lg" className="w-full" onClick={() => navigate({ to: "/checkout", search: { coupon: coupon?.code } })}>
              <Lock className="size-5" /> Proceed to Checkout <ArrowRight className="size-5" />
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ l, r, green }: { l: string; r: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/80">{l}</span>
      <span className={green ? "font-medium text-success" : "font-medium"}>{r}</span>
    </div>
  );
}
