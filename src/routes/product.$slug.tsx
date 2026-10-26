import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Gift, Heart, Leaf, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { AppHeader } from "@/components/olyon/chrome";
import { ProductCard } from "@/components/olyon/product-card";
import { Btn, QtyStepper, SectionTitle, Skel, Stars } from "@/components/olyon/ui";
import { productImage } from "@/lib/images";
import { DeliveryInfo, Highlights, ProductFaq, RatingsSummary } from "@/components/olyon/product-sections";
import { inr, percentOff, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { colorsOf, productQuery, productsQuery, useAddToCart, useToggleWishlist } from "@/lib/shop";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} — Orrion` },
        { name: "description", content: `Shop ${name} on Orrion with cash on delivery and free shipping above ₹999.` },
        { property: "og:title", content: `${name} — Orrion` },
        { property: "og:description", content: `Shop ${name} on Orrion.` },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

const views = [
  { label: "Full view", cls: "object-center scale-100" },
  { label: "Detail", cls: "object-center scale-150" },
  { label: "Left", cls: "object-left scale-125" },
  { label: "Right", cls: "object-right scale-125" },
];

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: p, isLoading } = useQuery(productQuery(slug));
  const all = useQuery(productsQuery);
  const add = useAddToCart();
  const wl = useToggleWishlist();
  const [view, setView] = useState(0);
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const pageRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (!pageRef.current || !p) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-portal]", { scale: 0.6, autoAlpha: 0, duration: 1.2 })
        .from("[data-orbit]", { rotate: -120, autoAlpha: 0, duration: 1.6, transformOrigin: "50% 50%" }, 0)
        .from("[data-hotspot]", { scale: 0, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2)" }, 0.5)
        .from("[data-in]", { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, 0.3)
        .from("[data-dock]", { y: 80, autoAlpha: 0, duration: 0.9 }, 0.6);
      gsap.to("[data-orbit]", { rotate: 360, duration: 50, ease: "none", repeat: -1, transformOrigin: "50% 50%", delay: 1.6 });
      gsap.to("[data-hotspot]", { y: -4, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.5, delay: 1.2 });
    }, pageRef);
    return () => ctx.revert();
  }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useIsoLayoutEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => gsap.fromTo("[data-shot]", { scale: 1.25, rotate: -6, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", clearProps: "scale,rotate" }), pageRef);
    return () => ctx.revert();
  }, [view]);

  useEffect(() => {
    if (p) setColor(colorsOf(p)[0]?.name ?? "");
    setQty(1);
    setView(0);
  }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div>
        <AppHeader back tagline="" />
        <Skel className="aspect-square w-full rounded-[2rem]" />
        <Skel className="mt-6 h-10 w-2/3" />
        <Skel className="mt-3 h-5 w-1/2" />
      </div>
    );
  }
  if (!p) {
    return (
      <div>
        <AppHeader back tagline="" />
        <div className="py-20 text-center">
          <h1 className="text-3xl">Product not found</h1>
          <Link to="/shop" className="mt-4 inline-block font-semibold text-olive">Browse all products</Link>
        </div>
      </div>
    );
  }

  const off = percentOff(p.price, p.compare_at);
  const colors = colorsOf(p);
  const soldOut = p.stock <= 0;
  const saved = wl.has(p.id);
  const related = (all.data ?? []).filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const buyNow = () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/product/${p.slug}` } });
      return;
    }
    add.mutate({ product: p, color, quantity: qty }, { onSuccess: () => navigate({ to: "/checkout" }) });
  };

  return (
    <div ref={pageRef}>
      <AppHeader back />
      <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Specimen stage */}
        <section className="relative overflow-hidden rounded-[1.75rem] border border-border bg-forest" aria-label="Product viewer">
          <div className="absolute inset-0 grid-lines opacity-70" />
          <div className="relative flex items-center justify-between px-4 pt-4 font-mono-ui text-[9px] uppercase text-muted-foreground">
            <span>Specimen / {p.category}</span>
            <span>View {String(view + 1).padStart(2, "0")}—{String(views.length).padStart(2, "0")}</span>
          </div>
          <div className="relative mx-auto my-4 aspect-square w-[82%] max-w-md">
            <svg data-orbit viewBox="0 0 200 200" className="absolute inset-[-6%] size-[112%] text-olive/50" aria-hidden>
              <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 4" />
              <circle cx="100" cy="2" r="2.2" className="fill-primary" />
              <circle cx="2" cy="100" r="1.4" className="fill-olive" />
            </svg>
            <div data-portal className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-foreground/10 shadow-lift">
              <img key={view} data-shot src={productImage(p.image)} alt={`${p.name} — ${views[view]!.label}`} width={800} height={800}
                className={cn("size-full object-cover transition-transform duration-700", views[view]!.cls)} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_40%,var(--forest)_100%)]" />
            </div>
            {p.features.slice(0, 3).map((f, i) => {
              const pos = [
                "left-[-4%] top-[14%]", "right-[-6%] top-[44%]", "left-[2%] bottom-[8%]",
              ][i]!;
              return (
                <div key={f} data-hotspot className={cn("hud-glass absolute flex max-w-[9.5rem] items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5", pos)}>
                  <span className="grid size-4 shrink-0 place-items-center rounded-full bg-primary/20"><span className="size-1.5 rounded-full bg-primary" /></span>
                  <span className="truncate text-[9.5px] text-foreground/85">{f}</span>
                </div>
              );
            })}
          </div>
          <div className="relative flex items-center justify-center gap-2 pb-4">
            {views.map((v, i) => (
              <button key={v.label} onClick={() => setView(i)} aria-label={`Show ${v.label}`} aria-pressed={view === i}
                className={cn("size-11 overflow-hidden rounded-full ring-1 transition", view === i ? "ring-2 ring-olive" : "opacity-50 ring-border hover:opacity-90")}>
                <img src={productImage(p.image)} alt="" loading="lazy" width={88} height={88} className={cn("size-full object-cover", v.cls)} />
              </button>
            ))}
          </div>
          {p.badge ? (
            <span className="absolute left-4 top-10 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-mono-ui text-[9px] uppercase text-primary-foreground">
              <Flame className="size-3" /> {p.badge}
            </span>
          ) : null}
        </section>

        {/* Data sheet */}
        <section className="mt-5 lg:mt-0" aria-label="Product details">
          <p data-in className="font-mono-ui text-[9px] uppercase text-olive">Orrion edit · No. {p.id.slice(0, 4)}</p>
          <h1 data-in className="mt-1.5 text-[1.65rem] leading-[1.08]">{p.name}</h1>
          <p data-in className="mt-1 text-[0.82rem] text-muted-foreground">{p.tagline}</p>

          <div data-in className="mt-4 flex items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">{inr(p.price)}</span>
              {p.compare_at ? <span className="text-xs text-muted-foreground line-through">{inr(p.compare_at)}</span> : null}
            </div>
            {off ? <span className="rounded-full border border-olive/50 px-2 py-0.5 font-mono-ui text-[9px] text-olive">SAVE {off}%</span> : null}
          </div>

          <dl data-in className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/60 font-mono-ui text-[10px] uppercase">
            {[
              ["Rating", <span key="r" className="flex items-center gap-1.5 normal-case"><Stars rating={Number(p.rating)} className="[&_svg]:size-3" />{Number(p.rating).toFixed(1)} · {p.reviews.toLocaleString("en-IN")}</span>],
              ["Status", <span key="s" className={soldOut ? "text-destructive" : p.stock <= 10 ? "text-primary" : "text-success"}>{soldOut ? "Out of stock" : p.stock <= 10 ? `Only ${p.stock} left` : "In stock"}</span>],
              ["Shipping", `Free above ₹${FREE_SHIPPING_THRESHOLD}`],
              ["Payment", "Cash on delivery"],
              ["Returns", "7-day easy"],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex items-center justify-between px-3.5 py-2.5">
                <dt className="text-muted-foreground">{k}</dt><dd className="text-foreground/90">{v}</dd>
              </div>
            ))}
          </dl>

          <p data-in className="mt-4 text-[0.82rem] leading-relaxed text-muted-foreground">{p.description}</p>

          <div data-in className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            {colors.length ? (
              <div>
                <p className="mb-2 font-mono-ui text-[9px] uppercase text-muted-foreground">Finish — <span className="text-foreground">{color}</span></p>
                <div className="flex gap-2" role="radiogroup" aria-label="Color">
                  {colors.map((c) => (
                    <button key={c.name} role="radio" aria-checked={color === c.name} aria-label={c.name} onClick={() => setColor(c.name)}
                      className={cn("grid size-9 place-items-center rounded-full border transition", color === c.name ? "border-olive" : "border-transparent")}>
                      <span className="size-6 rounded-full ring-1 ring-border" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : <div />}
            <div>
              <p className="mb-2 font-mono-ui text-[9px] uppercase text-muted-foreground">Qty</p>
              <QtyStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(p.stock, 20))} />
            </div>
          </div>
          <p data-in className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Leaf className="size-3.5 text-olive" /> Thoughtfully sourced <Gift className="ml-2 size-3.5 text-olive" /> Gift-ready <ShieldCheck className="ml-2 size-3.5 text-olive" /> Secure
          </p>
        </section>
      </div>

      {/* Floating action dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.2rem+env(safe-area-inset-bottom))] z-30 px-4">
        <div data-dock className="hud-glass pointer-events-auto mx-auto flex max-w-sm items-center gap-2 rounded-full p-1.5">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => wl.toggle(p)} aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary">
            <Heart className={cn("size-4", saved ? "fill-primary text-primary" : "text-foreground")} />
          </motion.button>
          <Btn size="sm" variant="outline" className="h-10 flex-1 text-[0.78rem]" disabled={soldOut} loading={add.isPending}
            onClick={() => add.mutate({ product: p, color, quantity: qty })}>
            <ShoppingBag className="size-4" /> {soldOut ? "Sold out" : "Add"}
          </Btn>
          <Btn size="sm" className="h-10 flex-[1.3] text-[0.78rem]" disabled={soldOut} onClick={buyNow}>
            <Zap className="size-4" /> Buy · {inr(p.price * qty)}
          </Btn>
        </div>
      </div>

      <Highlights p={p} />
      <div className="lg:grid lg:grid-cols-2 lg:gap-4">
        <DeliveryInfo />
        <RatingsSummary p={p} />
      </div>
      <ProductFaq p={p} />

      {related.length ? (
        <section className="mt-12">
          <SectionTitle>You may also like</SectionTitle>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{related.map((r, i) => <ProductCard key={r.id} p={r} index={i} />)}</div>
        </section>
      ) : null}
    </div>
  );
}
