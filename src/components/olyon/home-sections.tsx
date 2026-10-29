import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Banknote, Heart, Plus, RotateCcw, ShieldCheck, Timer, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { productImage } from "@/lib/images";
import { inr, percentOff } from "@/lib/pricing";
import { colorsOf, useAddToCart, useToggleWishlist, type Product } from "@/lib/shop";
import { Pill, SectionTitle, Stars } from "./ui";
import earbuds from "@/assets/p-earbuds.jpg";
import silk from "@/assets/p-silk.jpg";

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, end.getTime() - Date.now()));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return ["--", "--", "--"];
  const s = Math.floor(left / 1000);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0"));
}

export function DealOfDay({ products }: { products: Product[] }) {
  const time = useCountdown();
  const deal = [...products].filter((p) => p.stock > 0).sort((a, b) => percentOff(b.price, b.compare_at) - percentOff(a.price, a.compare_at))[0];
  if (!deal) return null;
  return (
    <section data-reveal className="mt-12">
      <SectionTitle>Deal of the Day</SectionTitle>
      <Link to="/product/$slug" params={{ slug: deal.slug }}
        className="surface grid overflow-hidden rounded-[1.75rem] md:grid-cols-2">
        <img src={productImage(deal.image)} alt={deal.name} loading="lazy" width={600} height={600} className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full" />
        <div className="flex flex-col justify-center p-6">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><Timer className="size-4" /> Ends in</span>
          <div className="mt-2 flex gap-2">
            {time.map((t, i) => (
              <span key={i} className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-secondary font-mono-ui text-lg tabular-nums">{t}</span>
            ))}
          </div>
          <h3 className="mt-4 text-xl">{deal.name}</h3>
          <p className="text-sm text-muted-foreground">{deal.tagline}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xl font-semibold">{inr(deal.price)}</span>
            {deal.compare_at ? <span className="text-muted-foreground line-through">{inr(deal.compare_at)}</span> : null}
            <Pill tone="plum">{percentOff(deal.price, deal.compare_at)}% OFF</Pill>
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-olive">Grab the deal <ArrowRight className="size-4" /></span>
        </div>
      </Link>
    </section>
  );
}

export function EditorialBanners() {
  const tiles = [
    { img: earbuds, eyebrow: "Gadgets & Tech", title: "Sound, in silence", cat: "tech" },
    { img: silk, eyebrow: "Beauty & Self Care", title: "Nightly rituals", cat: "beauty" },
  ];
  return (
    <section data-reveal className="mt-12 grid gap-3 md:grid-cols-2">
      {tiles.map((t) => (
        <Link key={t.cat} to="/shop" search={{ category: t.cat }} className="group relative block aspect-[16/10] overflow-hidden rounded-[1.75rem]">
          <img src={t.img} alt="" loading="lazy" width={768} height={480} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
            <p className="eyebrow opacity-80">{t.eyebrow}</p>
            <h3 className="mt-1 text-xl">{t.title}</h3>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold">Explore <ArrowRight className="size-4" /></span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export function NewArrivals({ products }: { products: Product[] }) {
  const list = [...products].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);
  return (
    <section data-reveal className="mt-12">
      <SectionTitle action={<Link to="/shop" search={{ sort: "new" }} className="flex items-center gap-1 text-sm font-semibold text-olive">See all <ArrowRight className="size-4" /></Link>}>
        New Arrivals
      </SectionTitle>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {list.map((p) => (
          <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="surface w-40 shrink-0 snap-start overflow-hidden rounded-3xl">
            <img src={productImage(p.image)} alt={p.name} loading="lazy" width={160} height={200} className="aspect-[4/5] w-full object-cover" />
            <div className="p-3">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{inr(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BestSellers({ products }: { products: Product[] }) {
  const list = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);
  return (
    <section data-reveal className="mt-12">
      <SectionTitle>Best Sellers</SectionTitle>
      <ol className="grid gap-3 md:grid-cols-2">
        {list.map((p, i) => (
          <li key={p.id}>
            <Link to="/product/$slug" params={{ slug: p.slug }} className="surface grid grid-cols-[auto_4.5rem_minmax(0,1fr)] items-center gap-4 rounded-3xl p-3 pr-4">
              <span className="w-8 text-center font-mono-ui text-lg text-primary">{i + 1}</span>
              <img src={productImage(p.image)} alt="" loading="lazy" width={72} height={72} className="size-[4.5rem] rounded-2xl object-cover" />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Stars rating={Number(p.rating)} className="[&_svg]:size-3" />{p.reviews.toLocaleString("en-IN")}</span>
                <span className="mt-1 block font-bold">{inr(p.price)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TrustStrip() {
  const items = [
    { i: Banknote, t: "Cash on Delivery", s: "Pay at your door" },
    { i: Truck, t: "Free Shipping", s: "On orders above ₹999" },
    { i: RotateCcw, t: "7-Day Returns", s: "Hassle-free" },
    { i: ShieldCheck, t: "Secure Checkout", s: "Your data protected" },
  ];
  return (
    <section data-reveal className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ i: I, t, s }) => (
        <div key={t} className="surface flex items-center gap-3 rounded-3xl p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-olive-soft text-olive"><I className="size-5" /></span>
          <span className="min-w-0"><span className="block text-sm font-semibold">{t}</span><span className="text-xs text-muted-foreground">{s}</span></span>
        </div>
      ))}
    </section>
  );
}

export function SpotlightBanners({ products }: { products: Product[] }) {
  const navigate = useNavigate();
  const add = useAddToCart();
  const wl = useToggleWishlist();
  const list = [...products].filter((p) => p.stock > 0 && p.compare_at).sort((a, b) => percentOff(b.price, b.compare_at) - percentOff(a.price, a.compare_at)).slice(0, 3);
  if (!list.length) return null;
  return (
    <section data-reveal className="mt-8" aria-label="Spotlight">
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {list.map((p) => {
          const color = colorsOf(p)[0]?.name ?? "";
          const saved = wl.has(p.id);
          const [l1, ...rest] = (p.tagline || p.name).split(/(?<=\.)\s+/);
          return (
            <article key={p.id} className="relative grid w-[92%] shrink-0 snap-center grid-cols-[1.1fr_1fr] overflow-hidden rounded-[1.5rem] bg-olive-soft text-paper-foreground shadow-lift md:w-[640px]">
              <div className="relative z-10 bg-paper p-4 pr-2 md:p-6">
                <span className="absolute -right-10 -top-[10%] h-[120%] w-20 rounded-[50%] bg-paper" />
                <div className="relative">
                  <p className="font-brand text-[7px] tracking-[0.35em] md:text-[9px]">ORRION / CURATED FINDS</p>
                  <h3 className="mt-2 font-display text-[1.05rem] font-semibold leading-[1.05] md:text-2xl">{l1}{rest.length ? <><br />{rest.join(" ")}</> : null}</h3>
                  <p className="mt-1 truncate text-[10px] text-paper-muted md:text-sm">{p.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-bold tabular-nums md:text-lg">{inr(p.price)}</span>
                    <span className="text-[10px] text-paper-muted line-through">{inr(p.compare_at!)}</span>
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-semibold text-primary-foreground">{percentOff(p.price, p.compare_at)}% OFF</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => add.mutate({ product: p, color, quantity: 1 }, { onSuccess: () => navigate({ to: "/cart" }) })}
                      disabled={add.isPending}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[10px] font-semibold text-paper disabled:opacity-50">
                      Buy Now <ArrowUpRight className="size-3.5" />
                    </button>
                    <button onClick={() => add.mutate({ product: p, color, quantity: 1 })} aria-label={`Add ${p.name} to cart`}
                      className="grid size-8 place-items-center rounded-full bg-olive-soft text-paper"><Plus className="size-4" /></button>
                  </div>
                </div>
              </div>
              <Link to="/product/$slug" params={{ slug: p.slug }} className="relative block">
                <img src={productImage(p.image)} alt={p.name} loading="lazy" width={300} height={300}
                  className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover shadow-lift" />
                <span className="absolute left-[8%] top-[22%] h-[56%] w-[90%] -rotate-12 rounded-[50%] border border-paper/30" />
                <span className="absolute bottom-3 right-3 text-right font-brand text-[6px] leading-relaxed tracking-[0.3em] text-paper/80">ORRION<br />SPOTLIGHT</span>
              </Link>
              <button onClick={() => wl.toggle(p)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={saved}
                className="absolute right-2.5 top-2.5 z-10 grid size-7 place-items-center text-paper">
                <Heart className={saved ? "size-4 fill-primary text-primary" : "size-4"} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
