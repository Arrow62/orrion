import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Menu, Search } from "lucide-react";
import type { ReactNode } from "react";
import forest from "@/assets/night-forest-magpie.jpg";
import stream from "@/assets/night-forest-stream.jpg";
import { CartButton } from "./chrome";
import { Button } from "@/components/ui/button";

/** Transparent header + forest painting with the magpie, used by cart and checkout. */
export function NightHero({ eyebrow, title, sub, back, cart = true, children }: {
  eyebrow: string; title: ReactNode; sub?: string; back?: boolean; cart?: boolean; children?: ReactNode;
}) {
  const router = useRouter();
  return (
    <section className="relative -mx-4 mb-6 overflow-hidden md:-mx-6">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img src={forest} alt="" width={1280} height={832} fetchPriority="high"
          className="night-drift absolute right-0 top-0 h-full w-full object-cover object-[78%_30%] md:w-[70%]" />
        <span className="night-rays absolute -top-10 right-[8%] h-[120%] w-1/2" />
        <span className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="relative px-4 pb-10 pt-[max(env(safe-area-inset-top),0.9rem)] md:px-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          {back ? (
            <button onClick={() => router.history.back()} aria-label="Go back"
              className="grid size-10 place-items-center rounded-full border border-foreground/25 text-foreground active:scale-90">
              <ArrowLeft className="size-[18px]" />
            </button>
          ) : (
            <Link to="/categories" aria-label="Browse categories" className="grid size-10 place-items-center text-foreground active:scale-90">
              <Menu className="size-6" strokeWidth={1.5} />
            </Link>
          )}
          <Link to="/" aria-label="Orrion home" className="flex items-center gap-2.5">
            <span className="grid size-5 place-items-center rounded-full border border-foreground/30">
              <span className="size-2 rounded-full bg-primary" />
            </span>
            <span className="font-brand text-lg tracking-[0.42em] text-foreground">ORRION</span>
          </Link>
          <div className="flex items-center justify-end gap-2">
            {cart ? (
              <>
                <Link to="/shop" aria-label="Search" className="grid size-10 place-items-center text-foreground active:scale-90">
                  <Search className="size-5" strokeWidth={1.6} />
                </Link>
                <CartButton />
              </>
            ) : null}
          </div>
        </div>
        <div className="mt-10 max-w-[70%] md:mt-14">
          <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-lime">
            {eyebrow}<span className="h-px w-16 bg-lime/70" />
          </p>
          <h1 className="mt-3 text-[2.15rem] leading-[1.1] text-foreground md:text-5xl">{title}</h1>
          {sub ? <p className="mt-2 text-[0.95rem] text-foreground/75">{sub}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}

/** Glowing forest stream that closes cart / checkout pages. */
export function NightFooter() {
  return (
    <div className="pointer-events-none relative -mx-4 mt-6 h-40 overflow-hidden md:-mx-6 md:h-56" aria-hidden>
      <img src={stream} alt="" width={1280} height={640} loading="lazy"
        className="absolute inset-0 size-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent,black_45%)]" />
      <span className="night-glow absolute bottom-[30%] left-1/2 size-16 -translate-x-1/2 rounded-full" />
    </div>
  );
}

/** Crimson pill CTA with leaf watermark. */
export function NightCta({ children, onClick, disabled, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <Button onClick={onClick} disabled={disabled}
      className={`night-cta relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full font-sans text-sm text-primary-foreground transition active:scale-[0.98] disabled:opacity-60 ${className}`}>
      <svg viewBox="0 0 120 60" className="pointer-events-none absolute left-2 top-0 h-full opacity-20" aria-hidden>
        <path d="M10 55 C30 20 60 8 100 6 C80 25 55 45 10 55Z" fill="currentColor" />
        <path d="M10 55 C40 35 70 20 100 6" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      {children}
    </Button>
  );
}
