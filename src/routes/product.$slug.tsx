import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Gift, Heart, Leaf, ShieldCheck, ShoppingBag, Truck, Zap, Sparkle } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/olyon/chrome";
import { ProductCard } from "@/components/olyon/product-card";
import { Btn, Pill, QtyStepper, SectionTitle, Skel, Stars } from "@/components/olyon/ui";
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
    <div>
      <AppHeader back tagline="Viral products ✦ Better you" />
      <div className="lg:grid lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-forest shadow-lift">
            <AnimatePresence mode="wait">
              <motion.img key={view} src={productImage(p.image)} alt={`${p.name} — ${views[view]!.label}`} width={800} height={800}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                className={cn("size-full object-cover transition-transform duration-500", views[view]!.cls)} />
            </AnimatePresence>
            {p.features.length ? (
              <div className="absolute inset-y-6 right-0 hidden w-32 flex-col justify-center gap-5 rounded-l-3xl border-l border-primary-foreground/15 bg-forest/40 px-4 text-primary-foreground backdrop-blur-md sm:flex">
                {p.features.slice(0, 4).map((f) => (
                  <div key={f} className="text-xs leading-snug"><Sparkle className="mb-1 size-4" />{f}</div>
                ))}
              </div>
            ) : null}
            <span className="absolute bottom-4 right-4 rounded-full bg-forest/60 px-2.5 py-1 text-xs text-primary-foreground backdrop-blur">{view + 1}/{views.length}</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {views.map((v, i) => (
              <button key={v.label} onClick={() => setView(i)} aria-label={`Show ${v.label}`} aria-pressed={view === i}
                className={cn("aspect-[5/4] overflow-hidden rounded-2xl ring-2 transition", view === i ? "ring-olive" : "ring-transparent opacity-80")}>
                <img src={productImage(p.image)} alt="" loading="lazy" width={160} height={128} className={cn("size-full object-cover", v.cls)} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl leading-tight">{p.name}</h1>
              <p className="mt-1 text-foreground/80">{p.tagline}</p>
            </div>
            {p.badge ? <Pill tone="plum"><Flame className="size-3.5 text-destructive" /> {p.badge}</Pill> : null}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Stars rating={Number(p.rating)} />
            <span className="font-semibold">{Number(p.rating).toFixed(1)}</span>
            <span className="text-muted-foreground">({p.reviews.toLocaleString("en-IN")} reviews)</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-4xl font-bold">{inr(p.price)}</span>
            {p.compare_at ? <span className="text-lg text-muted-foreground line-through">{inr(p.compare_at)}</span> : null}
            {off ? <span className="rounded-full bg-olive px-3 py-1 text-sm font-semibold text-olive-foreground">{off}% OFF</span> : null}
          </div>
          <p className={cn("mt-2 text-sm font-medium", soldOut ? "text-destructive" : p.stock <= 10 ? "text-primary" : "text-success")}>
            {soldOut ? "Out of stock" : p.stock <= 10 ? `Only ${p.stock} left — order soon` : "In stock, ready to ship"}
          </p>

          <div className="my-5 grid grid-cols-4 gap-2 border-y border-border py-5 text-center text-[11px] leading-tight">
            {[
              { i: Leaf, t: "Thoughtfully sourced" },
              { i: Gift, t: "Great for gifts" },
              { i: ShieldCheck, t: "7-day easy returns" },
              { i: Truck, t: `Free ship above ₹${FREE_SHIPPING_THRESHOLD}` },
            ].map(({ i: I, t }) => (
              <div key={t} className="flex flex-col items-center gap-2">
                <span className="grid size-11 place-items-center rounded-full bg-secondary"><I className="size-5 text-olive" strokeWidth={1.6} /></span>
                {t}
              </div>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            {colors.length ? (
              <div>
                <p className="mb-2 text-sm">Color: <span className="font-semibold">{color}</span></p>
                <div className="flex gap-3" role="radiogroup" aria-label="Color">
                  {colors.map((c) => (
                    <button key={c.name} role="radio" aria-checked={color === c.name} aria-label={c.name} onClick={() => setColor(c.name)}
                      className={cn("grid size-12 place-items-center rounded-full border-2 transition", color === c.name ? "border-olive" : "border-transparent")}>
                      <span className="size-9 rounded-full shadow-inner ring-1 ring-border" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : <div />}
            <div>
              <p className="mb-2 text-sm">Quantity</p>
              <QtyStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(p.stock, 20))} />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Btn size="lg" className="flex-1" disabled={soldOut} loading={add.isPending}
              onClick={() => add.mutate({ product: p, color, quantity: qty })}>
              <ShoppingBag className="size-5" /> {soldOut ? "Sold out" : "Add to Cart"}
            </Btn>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => wl.toggle(p)} aria-pressed={saved}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              className="surface grid size-14 shrink-0 place-items-center rounded-full">
              <Heart className={cn("size-6", saved ? "fill-primary text-primary" : "text-primary")} />
            </motion.button>
          </div>
          <Btn variant="olive" size="lg" className="mt-3 w-full" disabled={soldOut} onClick={buyNow}>
            <Zap className="size-5" /> Buy Now
          </Btn>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Leaf className="size-4 text-olive" /> Cash on Delivery available ✦ Secure checkout
          </p>
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
