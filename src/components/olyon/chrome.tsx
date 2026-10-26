import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Home, LayoutGrid, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useCartCount } from "@/lib/shop";
import { Badge } from "./ui";
import forestMist from "@/assets/forest-mist.jpg";

export function Logo({ small }: { tagline?: string | undefined; small?: boolean | undefined }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-1.5" aria-label="Orrion home">
      <span className="relative grid size-4 place-items-center">
        <span className="absolute inset-0 rounded-full border border-olive/60 animate-orbit [border-top-color:transparent]" />
        <span className="size-1.5 rounded-full bg-primary shadow-glow" />
      </span>
      <span className={cn("font-brand font-semibold leading-none tracking-[0.42em] text-foreground", small ? "text-[0.8rem]" : "text-[0.92rem]")}>
        ORRION
      </span>
    </Link>
  );
}

export function CartButton() {
  const count = useCartCount();
  return (
    <Link to="/cart" className="relative grid size-8 place-items-center rounded-full bg-plum-gradient text-primary-foreground shadow-glow active:scale-90" aria-label={`Cart, ${count} items`}>
      <ShoppingBag className="size-[14px]" strokeWidth={2} />
      <Badge count={count} />
    </Link>
  );
}

const hudBtn = "grid size-8 place-items-center rounded-full text-foreground/80 transition hover:bg-secondary hover:text-foreground active:scale-90";

/** Floating HUD capsule header: action left, wordmark center, search + cart right. */
export function AppHeader({ back, right }: { back?: boolean; right?: ReactNode; tagline?: string | undefined }) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  useIsoLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hud]", { y: -18, autoAlpha: 0, duration: 0.8, ease: "expo.out" });
      gsap.from("[data-hud-item]", { y: -6, autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.15, ease: "power3.out" });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <header ref={ref} className="sticky top-0 z-30 -mx-4 mb-4 px-3 pt-[max(env(safe-area-inset-top),0.6rem)] md:-mx-6 md:px-5">
      <div data-hud className="hud-glass relative grid h-12 grid-cols-[1fr_auto_1fr] items-center overflow-hidden rounded-full px-2">
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent animate-scan" aria-hidden />
        <div className="flex items-center gap-1" data-hud-item>
          {back ? (
            <button onClick={() => router.history.back()} className={hudBtn} aria-label="Go back">
              <ArrowLeft className="size-[15px]" />
            </button>
          ) : (
            <Link to="/categories" className={hudBtn} aria-label="Browse categories">
              <Menu className="size-[15px]" />
            </Link>
          )}
          <span className="hidden items-center gap-1.5 font-mono-ui text-[9px] uppercase text-muted-foreground sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-olive" /> Live
          </span>
        </div>
        <div data-hud-item><Logo small={back} /></div>
        <div className="flex items-center justify-end gap-1" data-hud-item>
          {right ?? (
            <>
              <Link to="/shop" className={hudBtn} aria-label="Search">
                <Search className="size-[15px]" />
              </Link>
              <CartButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const tabs = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const count = useCartCount();
  const hidden = ["/auth", "/reset-password", "/checkout"].some((p) => pathname.startsWith(p)) || pathname.startsWith("/order-success");
  if (hidden) return null;
  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));
  const Tab = ({ t }: { t: (typeof tabs)[number] }) => {
    const active = isActive(t.to, "exact" in t ? t.exact : false);
    return (
      <Link to={t.to} className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium" aria-current={active ? "page" : undefined}>
        <t.icon className={cn("size-[19px] transition-colors", active ? "text-olive" : "text-muted-foreground")} strokeWidth={1.8} />
        <span className={active ? "text-foreground" : "text-muted-foreground"}>{t.label}</span>
        {active ? <motion.span layoutId="nav-dot" className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" /> : null}
      </Link>
    );
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),0.6rem)]" aria-label="Main">
      <div className="surface relative mx-auto flex max-w-sm items-end rounded-[1.6rem] px-1.5 pb-0.5 pt-1 backdrop-blur-xl">
        <Tab t={tabs[0]} />
        <Tab t={tabs[1]} />
        <div className="flex flex-1 justify-center">
          <Link to="/cart" aria-label={`Cart, ${count} items`}
            className="relative -mt-6 grid size-12 place-items-center rounded-full bg-plum-gradient text-primary-foreground shadow-glow ring-4 ring-background transition-transform active:scale-90">
            <ShoppingBag className="size-5" />
            <Badge count={count} />
          </Link>
        </div>
        <Tab t={tabs[2]} />
        <Tab t={tabs[3]} />
      </div>
    </nav>
  );
}

export function ForestFooter({ text = "More than shopping ✦ A better you" }: { text?: string }) {
  return (
    <div className="pointer-events-none relative mt-12 h-28 overflow-hidden" aria-hidden>
      <img src={forestMist} alt="" loading="lazy" width={1024} height={640}
        className="absolute inset-x-0 bottom-0 w-full object-cover opacity-20 grayscale [mask-image:linear-gradient(to_top,black,transparent)]" />
      <p className="relative pt-4 text-center eyebrow text-muted-foreground">{text}</p>
    </div>
  );
}
