import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useRef } from "react";
import { productImage } from "@/lib/images";
import { inr, percentOff } from "@/lib/pricing";
import { colorsOf, useAddToCart, useToggleWishlist, type Product } from "@/lib/shop";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Skel } from "./ui";

export function ProductCard({ p }: { p: Product; index?: number }) {
  const wl = useToggleWishlist();
  const add = useAddToCart();
  const heart = useRef<HTMLButtonElement>(null);
  const saved = wl.has(p.id);
  const off = percentOff(p.price, p.compare_at);
  const colors = colorsOf(p);
  const soldOut = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;

  return (
    <article data-reveal className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-olive/40 hover:shadow-lift">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img src={productImage(p.image)} alt={p.name} loading="lazy" width={400} height={400}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {off ? <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{off}% OFF</span> : null}
            {p.badge ? <span className="rounded-md bg-background/75 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur">{p.badge}</span> : null}
          </div>
          {soldOut ? (
            <span className="absolute inset-0 grid place-items-center bg-background/60 text-xs font-semibold uppercase tracking-wider backdrop-blur-[2px]">Sold out</span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Star className="size-3 fill-olive text-olive" />
            <span className="font-semibold text-foreground">{Number(p.rating).toFixed(1)}</span>
            <span>({p.reviews})</span>
            {colors.length > 1 ? (
              <span className="ml-auto flex -space-x-1">
                {colors.slice(0, 3).map((c) => (
                  <span key={c.name} className="size-2.5 rounded-full ring-1 ring-surface" style={{ backgroundColor: c.hex }} />
                ))}
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 line-clamp-2 min-h-[2.4em] text-[0.82rem] font-medium leading-[1.2] text-foreground">{p.name}</h3>
          <div className="mt-auto pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[0.95rem] font-bold tabular-nums">{inr(p.price)}</span>
              {p.compare_at ? <span className="text-[10px] text-muted-foreground line-through">{inr(p.compare_at)}</span> : null}
            </div>
            <p className={cn("mt-0.5 text-[10px]", low ? "text-primary" : "text-muted-foreground")}>
              {soldOut ? "Currently unavailable" : low ? `Only ${p.stock} left` : "Free delivery over ₹999"}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          disabled={soldOut || add.isPending}
          onClick={(e) => {
            gsap.fromTo(e.currentTarget, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
            add.mutate({ product: p, color: colors[0]?.name ?? "", quantity: 1 });
          }}
          aria-label={`Add ${p.name} to cart`}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-olive/40 text-[0.75rem] font-semibold text-olive transition hover:bg-olive hover:text-olive-foreground disabled:opacity-40"
        >
          <ShoppingBag className="size-3.5" /> Add to cart
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
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/60 backdrop-blur-md"
      >
        <Heart className={cn("size-4 transition-colors", saved ? "fill-primary text-primary" : "text-foreground")} />
      </button>
    </article>
  );
}

export function ProductGridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Skel className="aspect-square rounded-none" />
          <div className="space-y-2 p-3"><Skel className="h-3 w-3/4" /><Skel className="h-3 w-1/2" /><Skel className="h-8 w-full" /></div>
        </div>
      ))}
    </>
  );
}
