import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Lock, Plus, Rocket, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppHeader } from "@/components/olyon/chrome";
import { AddressForm } from "@/components/olyon/address-form";
import { Btn, PageTitle, Skel } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { productImage } from "@/lib/images";
import { computeTotals, inr, type Delivery } from "@/lib/pricing";
import { useCart } from "@/lib/shop";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: z.object({ coupon: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Checkout — Orrion" },
      { name: "description", content: "Complete your Orrion order with cash on delivery." },
      { property: "og:title", content: "Checkout — Orrion" },
      { property: "og:description", content: "Complete your Orrion order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { coupon: code } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cart = useCart();
  const key = useRef(crypto.randomUUID());
  const [addressId, setAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [busy, setBusy] = useState(false);

  const addresses = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => (await supabase.from("addresses").select("*").order("created_at")).data ?? [],
  });
  const coupon = useQuery({
    queryKey: ["coupon", code],
    enabled: !!code,
    queryFn: async () => (await supabase.from("coupons").select("*").eq("code", code!).maybeSingle()).data,
  });
  useEffect(() => {
    if (!addressId && addresses.data?.[0]) setAddressId(addresses.data[0].id);
  }, [addresses.data, addressId]);

  const items = cart.data ?? [];
  const t = computeTotals(items.map((i) => ({ price: i.product.price, compare_at: i.product.compare_at, quantity: i.quantity })), delivery, coupon.data);

  const place = async () => {
    if (!addressId) { toast.error("Add a shipping address first"); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", {
      _address_id: addressId, _delivery: delivery, _coupon: code ?? "", _idempotency_key: key.current,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    const row = data?.[0];
    navigate({ to: "/order-success/$id", params: { id: row!.order_id }, replace: true });
  };

  if (cart.isLoading) return <div><AppHeader back /><Skel className="h-80" /></div>;
  if (!items.length) {
    return (
      <div><AppHeader back />
        <p className="py-20 text-center text-muted-foreground">Your cart is empty. <Link to="/shop" className="font-semibold text-olive">Shop now</Link></p>
      </div>
    );
  }

  return (
    <div>
      <AppHeader back />
      <PageTitle title="Checkout" sub="Complete your order in just a few steps" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="space-y-4">
          <Section n={1} title="Shipping Address" sub="Where should we deliver your order?">
            <div className="space-y-2.5">
              {(addresses.data ?? []).map((a) => (
                <label key={a.id} className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4", addressId === a.id ? "border-olive bg-olive-soft" : "border-border")}>
                  <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-[var(--olive)]" />
                  <span className="text-sm"><strong className="block">{a.full_name} · {a.phone}</strong>{a.line1}, {a.city}, {a.state} – {a.pincode}</span>
                </label>
              ))}
              {adding || !addresses.data?.length ? (
                <AddressForm onDone={(a) => { setAddressId(a.id); setAdding(false); }} onCancel={addresses.data?.length ? () => setAdding(false) : undefined} />
              ) : (
                <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm font-semibold text-olive"><Plus className="size-4" /> Add new address</button>
              )}
            </div>
          </Section>
          <Section n={2} title="Delivery Option" sub="Choose how you want your order delivered">
            {([
              { v: "standard", i: Truck, t: "Standard Delivery", s: "5–7 business days", p: t.subtotal >= 999 ? "FREE" : inr(49) },
              { v: "express", i: Rocket, t: "Express Delivery", s: "2–3 business days", p: inr(99) },
            ] as const).map((o) => (
              <label key={o.v} className={cn("mb-2.5 flex cursor-pointer items-center gap-3 rounded-2xl border p-4", delivery === o.v ? "border-olive bg-olive-soft" : "border-border")}>
                <input type="radio" name="del" checked={delivery === o.v} onChange={() => setDelivery(o.v)} className="accent-[var(--olive)]" />
                <o.i className="size-5" />
                <span className="flex-1 text-sm"><strong className="block">{o.t}</strong><span className="text-muted-foreground">{o.s}</span></span>
                <span className="text-sm font-semibold">{o.p}</span>
              </label>
            ))}
          </Section>
          <Section n={3} title="Payment Method" sub="Online payments are coming soon">
            <label className="flex items-center gap-3 rounded-2xl border border-olive bg-olive-soft p-4">
              <input type="radio" checked readOnly className="accent-[var(--olive)]" />
              <Banknote className="size-5" /><span className="text-sm font-semibold">Cash on Delivery</span>
            </label>
          </Section>
        </div>
        <aside className="surface mt-4 h-fit rounded-3xl p-5 lg:mt-0">
          <h2 className="text-xl">Order Summary</h2>
          <ul className="my-4 space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <img src={productImage(i.product.image)} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{i.product.name}</span><span className="text-muted-foreground">{i.color} · Qty {i.quantity}</span></span>
                <span>{inr(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(t.subtotal)}</span></div>
            {t.discount ? <div className="flex justify-between text-success"><span>Coupon {code}</span><span>- {inr(t.discount)}</span></div> : null}
            <div className="flex justify-between"><span>Shipping</span><span className={t.shipping ? "" : "text-success"}>{t.shipping ? inr(t.shipping) : "FREE"}</span></div>
            <div className="flex justify-between border-t border-border pt-3 text-lg font-bold"><span>Total</span><span>{inr(t.total)}</span></div>
          </div>
          <Btn size="lg" className="mt-5 w-full" loading={busy} onClick={place}><Lock className="size-4" /> Place Order (COD)</Btn>
        </aside>
      </div>
    </div>
  );
}

function Section({ n, title, sub, children }: { n: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="surface rounded-3xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-olive font-semibold text-olive-foreground">{n}</span>
        <div><h2 className="text-xl">{title}</h2><p className="text-xs text-muted-foreground">{sub}</p></div>
      </div>
      {children}
    </section>
  );
}
