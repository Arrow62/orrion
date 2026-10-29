import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { useRef } from "react";
import { productImage } from "@/lib/images";
import { inr, percentOff } from "@/lib/pricing";
import { colorsOf, useAddToCart, useToggleWishlist, type Product } from "@/lib/shop";
import { gsap, useTilt } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Skel } from "./ui";

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const wl = useToggleWishlist();
  const add = useAddToCart();
  const ref = useRef<HTMLElement>(null);
  const heart = useRef<HTMLButtonElement>(null);
  useTilt(ref, 7);
  const saved = wl.has(p.id);
  const off = percentOff(p.price, p.compare_at);
  const code = `OR-${String(index + 1).padStart(2, "0")}`;

  return (
    <article ref={ref} data-reveal className="group relative [transform-style:preserve-3d]">
      <div className="relative overflow-hidden rounded-[1.4rem] border border-border bg-surface shadow-soft">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
          <div className="corners relative aspect-[4/5] overflow-hidden bg-forest">
            <img src={productImage(p.image)} alt={p.name} loading="lazy" width={400} height={500}
              className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-forest/30" />
            <span className="shine pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute left-3 top-3 font-mono-ui text-[9px] uppercase text-foreground/70">{code}</span>
            {off ? (
              <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2 py-0.5 font-mono-ui text-[9px] font-semibold text-primary-foreground">−{off}%</span>
            ) : null}
            {p.stock === 0 ? (
              <span className="absolute inset-0 grid place-items-center bg-background/60 font-mono-ui text-[10px] uppercase backdrop-blur-[2px]">Sold out</span>
            ) : null}
          </div>
          <div className="px-3 pb-3 pt-2.5">
            <h3 className="truncate font-sans text-[0.8rem] font-medium tracking-tight text-foreground/90">{p.name}</h3>
            <div className="mt-1 flex items-center gap-1.5">
              {colorsOf(p).slice(0, 3).map((c) => (
                <span key={c.name} className="size-2 rounded-full ring-1 ring-border" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5 pr-9">
              <span className="text-[0.92rem] font-semibold tabular-nums">{inr(p.price)}</span>
              {p.compare_at ? <span className="text-[10px] text-muted-foreground line-through">{inr(p.compare_at)}</span> : null}
            </div>
          </div>
        </Link>
        <button
          disabled={p.stock === 0 || add.isPending}
          onClick={(e) => {
            gsap.fromTo(e.currentTarget, { rotate: 0, scale: 0.8 }, { rotate: 90, scale: 1, duration: 0.5, ease: "back.out(3)" });
            add.mutate({ product: p, color: colorsOf(p)[0]?.name ?? "", quantity: 1 });
          }}
          aria-label={`Add ${p.name} to cart`}
          className="absolute bottom-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-olive text-olive-foreground transition hover:brightness-110 disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <button
        ref={heart}
        onClick={() => {
          if (heart.current) gsap.fromTo(heart.current, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.2,0.4)" });
          wl.toggle(p);
        }}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
        className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-background/40 backdrop-blur-md"
      >
        <Heart className={cn("size-[14px] transition-colors", saved ? "fill-primary text-primary" : "text-foreground")} />
      </button>
    </article>
  );
}

export function ProductGridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[1.4rem] border border-border bg-surface">
          <Skel className="aspect-[4/5] rounded-none" />
          <div className="space-y-2 p-3"><Skel className="h-3 w-3/4" /><Skel className="h-3 w-1/2" /></div>
        </div>
      ))}
    </>
  );
}
