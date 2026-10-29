import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Heart, Plus } from "lucide-react";
import { useRef } from "react";
import { productImage } from "@/lib/images";
import { inr, percentOff } from "@/lib/pricing";
import { colorsOf, useAddToCart, useToggleWishlist, type Product } from "@/lib/shop";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Skel } from "./ui";

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const wl = useToggleWishlist();
  const add = useAddToCart();
  const navigate = useNavigate();
  const heart = useRef<HTMLButtonElement>(null);
  const saved = wl.has(p.id);
  const off = percentOff(p.price, p.compare_at);
  const num = String(index + 1).padStart(2, "0");
  const color = colorsOf(p)[0]?.name ?? "";
  const soldOut = p.stock === 0;

  return (
    <article data-reveal className="group relative pl-3">
      {/* olive spine */}
      <div className="absolute inset-y-3 left-0 w-10 rounded-l-[1.4rem] bg-olive-soft">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap font-brand text-[7px] tracking-[0.35em] text-paper/80">
          THE ORRION EDIT
        </span>
        <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
          <span className="size-1 rounded-full bg-paper/70" />
          <span className="size-2 rounded-full border border-paper/70" />
          <span className="size-1 rounded-full bg-paper/70" />
        </span>
      </div>

      <div className="relative ml-4 overflow-hidden rounded-[1.4rem] bg-paper text-paper-foreground shadow-soft">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
          <div className="relative aspect-[4/4.2] overflow-hidden">
            <span className="pointer-events-none absolute -right-1 top-6 font-display text-[4.5rem] leading-none text-paper-foreground/[0.07]">{num}</span>
            <div className="absolute left-3 top-3 leading-tight">
              <p className="font-brand text-[8px] tracking-[0.3em]">ORRION</p>
              <p className="text-[6px] tracking-[0.3em] text-paper-muted">FINDS</p>
            </div>
            <img src={productImage(p.image)} alt={p.name} loading="lazy" width={400} height={420}
              className="absolute inset-x-[10%] bottom-1 top-[18%] m-auto size-[80%] rounded-full object-cover shadow-lift transition-transform duration-700 group-hover:scale-105" />
            <span className="pointer-events-none absolute left-[6%] top-[22%] h-[60%] w-[88%] -rotate-12 rounded-[50%] border border-olive/50" />
            {off ? (
              <span className="absolute bottom-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">−{off}%</span>
            ) : null}
            {soldOut ? (
              <span className="absolute inset-0 grid place-items-center bg-paper/70 text-[10px] font-semibold uppercase tracking-widest">Sold out</span>
            ) : null}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 pt-1">
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-sans text-[0.85rem] font-bold leading-[1.1] tracking-tight">{p.name}</h3>
              <p className="mt-0.5 truncate text-[9px] text-paper-muted">{p.tagline}</p>
            </div>
            <div className="border-l border-paper-foreground/15 pl-2 text-right">
              <p className="text-[0.85rem] font-bold tabular-nums">{inr(p.price)}</p>
              {p.compare_at ? <p className="text-[9px] text-paper-muted line-through">{inr(p.compare_at)}</p> : null}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2 p-2.5 pt-2.5">
          <button
            disabled={soldOut || add.isPending}
            onClick={() => add.mutate({ product: p, color, quantity: 1 }, { onSuccess: () => navigate({ to: "/cart" }) })}
            className="flex h-8 min-w-0 flex-1 items-center justify-between rounded-full bg-ink px-3 text-[10px] font-semibold tracking-wide text-paper disabled:opacity-40"
          >
            Buy Now <ArrowUpRight className="size-3.5" />
          </button>
          <button
            disabled={soldOut || add.isPending}
            onClick={(e) => {
              gsap.fromTo(e.currentTarget, { rotate: 0, scale: 0.8 }, { rotate: 90, scale: 1, duration: 0.5, ease: "back.out(3)" });
              add.mutate({ product: p, color, quantity: 1 });
            }}
            aria-label={`Add ${p.name} to cart`}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-olive-soft text-paper disabled:opacity-40"
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
          className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full border border-paper-foreground/25"
        >
          <Heart className={cn("size-3.5", saved ? "fill-primary text-primary" : "text-paper-foreground")} />
        </button>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="ml-7 overflow-hidden rounded-[1.4rem] border border-border bg-surface">
          <Skel className="aspect-[4/5] rounded-none" />
          <div className="space-y-2 p-3"><Skel className="h-3 w-3/4" /><Skel className="h-3 w-1/2" /></div>
        </div>
      ))}
    </>
  );
}
