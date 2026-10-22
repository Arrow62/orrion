import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { productImage } from "@/lib/images";
import { inr, percentOff } from "@/lib/pricing";
import { useToggleWishlist, type Product } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { Pill, Skel } from "./ui";

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const wl = useToggleWishlist();
  const saved = wl.has(p.id);
  const off = percentOff(p.price, p.compare_at);
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="surface group relative overflow-hidden rounded-3xl"
    >
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img src={productImage(p.image)} alt={p.name} loading="lazy" width={400} height={400}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          {p.stock === 0 ? (
            <span className="absolute inset-0 grid place-items-center bg-background/60 text-sm font-semibold backdrop-blur-[2px]">Sold out</span>
          ) : null}
        </div>
        <div className="p-3.5">
          <h3 className="truncate font-sans text-[0.92rem] font-semibold">{p.name}</h3>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base font-bold">{inr(p.price)}</span>
            {p.compare_at ? <span className="text-xs text-muted-foreground line-through">{inr(p.compare_at)}</span> : null}
          </div>
          {off ? <div className="mt-2"><Pill>{off}% OFF</Pill></div> : null}
        </div>
      </Link>
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => wl.toggle(p)}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
        className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-background/30 backdrop-blur-md"
      >
        <Heart className={cn("size-[18px] transition-colors", saved ? "fill-primary text-primary" : "text-primary-foreground drop-shadow")} />
      </motion.button>
    </motion.article>
  );
}

export function ProductGridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="surface overflow-hidden rounded-3xl">
          <Skel className="aspect-square rounded-none" />
          <div className="space-y-2 p-3.5"><Skel className="h-4 w-3/4" /><Skel className="h-4 w-1/2" /></div>
        </div>
      ))}
    </>
  );
}
