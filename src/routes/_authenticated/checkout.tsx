import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Banknote, Building2, ChevronDown, CreditCard, Home, Lock, MapPin, Pencil, Plus, ShoppingBag, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AddressForm } from "@/components/olyon/address-form";
import { NightCta, NightFooter, NightHero } from "@/components/olyon/night";
import { Skel } from "@/components/olyon/ui";
import house from "@/assets/forest-house.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { productImage } from "@/lib/images";
import { computeTotals, inr } from "@/lib/pricing";
import { useCart, useUpdateCartQty } from "@/lib/shop";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: z.object({ coupon: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Checkout — Orrion" },
      { name: "description", content: "Complete your Orrion order with cash on delivery." },
      { property: "og:title", content: "Checkout — Orrion" },
      { property: "og:description", content: "Complete your Orrion order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const methods = [
  { id: "cod", label: "Cash on Delivery", icon: Banknote, live: true },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, live: false },
  { id: "upi", label: "UPI", icon: Smartphone, live: false },
  { id: "net", label: "Net Banking", icon: Building2, live: false },
] as const;

function Checkout() {
  const { coupon: code } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cart = useCart();
  const update = useUpdateCartQty();
  const key = useRef(crypto.randomUUID());
  const [addressId, setAddressId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
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
  const t = computeTotals(items.map((i) => ({ price: i.product.price, compare_at: i.product.compare_at, quantity: i.quantity })), "standard", coupon.data);
  const selected = addresses.data?.find((a) => a.id === addressId);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const place = async () => {
    if (!addressId) { toast.error("Add a delivery address first"); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", {
      _address_id: addressId, _delivery: "standard", _coupon: code ?? "", _idempotency_key: key.current,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    navigate({ to: "/order-success/$id", params: { id: data![0]!.order_id }, replace: true });
  };

  const hero = (
    <NightHero back cart={false} eyebrow="Checkout" title={<>Complete Your <em className="text-lime">Order</em></>} sub="Review your details and place your order">
      <svg viewBox="0 0 220 30" className="mt-3 w-52 text-lime" aria-hidden>
        <path d="M2 10 C60 30 140 30 200 18" stroke="currentColor" strokeWidth="1" fill="none" opacity=".7" />
        <path d="M200 18 C206 8 216 6 218 4 C216 14 210 20 200 18Z" fill="var(--olive)" />
      </svg>
    </NightHero>
  );

  if (cart.isLoading) return <div>{hero}<Skel className="h-80" /></div>;
  if (!items.length) {
    return (
      <div>{hero}
        <p className="py-16 text-center text-muted-foreground">Your cart is empty. <Link to="/shop" className="font-semibold text-lime">Shop now</Link></p>
        <NightFooter />
      </div>
    );
  }

  return (
    <div>
      {hero}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <div>
          {/* Delivery address */}
          <section className="relative overflow-hidden border-b border-foreground/10 pb-6">
            <img src={house} alt="" width={944} height={704} loading="lazy" aria-hidden
              className="pointer-events-none absolute -right-6 top-6 w-[46%] max-w-xs [mask-image:radial-gradient(closest-side,black_65%,transparent)]" />
            <div className="relative flex items-center justify-between">
              <h2 className="flex items-center gap-4 font-display text-2xl">
                <span className="grid size-11 place-items-center rounded-full bg-olive-soft text-lime"><MapPin className="size-5" /></span>
                Delivery Address
              </h2>
              {addresses.data?.length ? (
                <button onClick={() => setEditing((e) => !e)} className="flex items-center gap-2 text-sm">{editing ? "Done" : "Edit"} <Pencil className="size-4" /></button>
              ) : null}
            </div>
            <div className="relative mt-5 max-w-[58%]">
              {addresses.isLoading ? <Skel className="h-20" /> : selected && !editing ? (
                <>
                  <p className="text-lg font-semibold">{selected.full_name}</p>
                  <p className="mt-1 text-[0.9rem] text-foreground/85">{selected.line1}, {selected.city}, {selected.state} - {selected.pincode}</p>
                  <span className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-olive bg-olive-soft/60 px-4 text-sm"><Home className="size-4" /> {selected.phone}</span>
                </>
              ) : null}
            </div>
            {editing || !addresses.data?.length ? (
              <div className="relative mt-4 space-y-2.5">
                {(addresses.data ?? []).map((a) => (
                  <label key={a.id} className={cn("flex cursor-pointer gap-3 rounded-2xl border bg-background/80 p-4 backdrop-blur", addressId === a.id ? "border-lime" : "border-foreground/15")}>
                    <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-[var(--olive)]" />
                    <span className="text-sm"><strong className="block">{a.full_name} · {a.phone}</strong>{a.line1}, {a.city}, {a.state} – {a.pincode}</span>
                  </label>
                ))}
                {adding || !addresses.data?.length ? (
                  <div className="rounded-2xl bg-background/90 p-1 backdrop-blur">
                    <AddressForm onDone={(a) => { setAddressId(a.id); setAdding(false); setEditing(false); }} onCancel={addresses.data?.length ? () => setAdding(false) : undefined} />
                  </div>
                ) : (
                  <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm font-semibold text-lime"><Plus className="size-4" /> Add new address</button>
                )}
              </div>
            ) : null}
          </section>

          {/* Order items */}
          <section className="border-b border-foreground/10 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-4 font-display text-2xl"><ShoppingBag className="size-7" strokeWidth={1.4} /> Order Items</h2>
              <span className="text-sm">{count} Item{count === 1 ? "" : "s"}</span>
            </div>
            <ul>
              {items.map((i) => (
                <li key={i.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-foreground/10 py-4 last:border-0 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
                  <img src={productImage(i.product.image)} alt={i.product.name} width={240} height={200} loading="lazy" className="aspect-[6/5] w-full rounded-2xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-lg">{i.product.name}</p>
                    <p className="truncate text-[0.8rem] text-foreground/60">{i.product.tagline}</p>
                    <label className="relative mt-2 inline-flex h-8 items-center rounded-full border border-olive bg-olive-soft/50 pl-3 pr-7 text-sm">
                      <span className="sr-only">Quantity</span>
                      <select value={i.quantity} onChange={(e) => update.mutate({ id: i.id, quantity: Number(e.target.value) })}
                        className="appearance-none bg-transparent outline-none">
                        {Array.from({ length: Math.max(1, Math.min(i.product.stock, 10)) }, (_, n) => n + 1).map((n) => (
                          <option key={n} value={n} className="bg-background">Qty: {n}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5" />
                    </label>
                    <p className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-lime">{inr(i.product.price * i.quantity)}</span>
                      {i.product.compare_at ? <span className="text-[0.8rem] text-foreground/50 line-through">{inr(i.product.compare_at * i.quantity)}</span> : null}
                    </p>
                  </div>
                  <button onClick={() => update.mutate({ id: i.id, quantity: 0 })} aria-label={`Remove ${i.product.name}`}
                    className="grid size-10 place-items-center rounded-full border border-foreground/25 hover:text-destructive">
                    <Trash2 className="size-4" strokeWidth={1.6} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Payment */}
          <section className="border-b border-foreground/10 py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-display text-lg"><CreditCard className="size-5" strokeWidth={1.4} /> Payment Method</h2>
              <span className="flex items-center gap-1 text-[11px]"><Lock className="size-3.5" /> 100% Secure</span>
            </div>
            <div className="grid grid-cols-4 items-stretch">
              {methods.map((m, idx) => (
                <button key={m.id} disabled={!m.live} aria-pressed={m.live}
                  onClick={() => toast("Online payments are coming soon")}
                  className={cn("relative flex min-h-20 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-[10px] leading-tight",
                    m.live ? "rounded-lg border border-lime bg-olive-soft/60 text-foreground" : "text-foreground/45",
                    idx > 1 && "border-l border-foreground/10")}>
                  <m.icon className={cn("size-5", m.live ? "text-lime" : "")} strokeWidth={1.5} />
                  {m.label}
                  {!m.live ? <span className="text-[9px] uppercase tracking-wider text-foreground/40">Soon</span> : null}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Total + place order */}
        <aside className="h-fit py-4 lg:sticky lg:top-6">
          <div className="space-y-2 pb-4 text-sm">
            <div className="flex justify-between"><span className="text-foreground/80">Subtotal</span><span>{inr(t.subtotal)}</span></div>
            {t.discount ? <div className="flex justify-between text-lime"><span>Coupon {code}</span><span>- {inr(t.discount)}</span></div> : null}
            <div className="flex justify-between"><span className="text-foreground/80">Shipping</span><span className={t.shipping ? "" : "text-lime"}>{t.shipping ? inr(t.shipping) : "FREE"}</span></div>
          </div>
          <div className="grid grid-cols-[auto_1px_minmax(0,1fr)] items-center gap-3">
            <div>
              <p className="text-sm">Total Amount</p>
              <p className="text-xl font-bold text-lime">{inr(t.total)}</p>
            </div>
            <span className="h-10 bg-foreground/40" />
            <NightCta onClick={place} disabled={busy} className="w-full">
              {busy ? "Placing…" : "Place Order"} <ArrowRight className="size-4" />
            </NightCta>
          </div>
        </aside>
      </div>
      <NightFooter />
    </div>
  );
}
