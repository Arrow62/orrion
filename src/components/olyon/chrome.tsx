import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Home, LayoutGrid, Menu, Search, ShoppingBag, Sparkle, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCartCount } from "@/lib/shop";
import { Badge, iconBtn } from "./ui";
import forestMist from "@/assets/forest-mist.jpg";

export function Logo({ small }: { tagline?: string | undefined; small?: boolean | undefined }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2" aria-label="Orrion home">
      <Sparkle className={cn("shrink-0 fill-primary text-primary", small ? "size-3.5" : "size-4")} />
      <span className={cn("font-brand font-semibold leading-none tracking-[0.32em] text-foreground", small ? "text-lg" : "text-[1.45rem]")}>
        ORRION
      </span>
      <Sparkle className={cn("shrink-0 fill-olive text-olive", small ? "size-3.5" : "size-4")} />
    </Link>
  );
}

export function CartButton() {
  const count = useCartCount();
  return (
    <Link to="/cart" className={iconBtn({ variant: "plum" })} aria-label={`Cart, ${count} items`}>
      <ShoppingBag className="size-[18px]" />
      <Badge count={count} />
    </Link>
  );
}

/** Centered-wordmark header: action left, title center, search + cart right. */
export function AppHeader({ back, right }: { back?: boolean; right?: ReactNode; tagline?: string | undefined }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-5 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] md:-mx-6 md:px-6">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-b-3xl border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center">
          {back ? (
            <button onClick={() => router.history.back()} className={iconBtn()} aria-label="Go back">
              <ArrowLeft className="size-[18px]" />
            </button>
          ) : (
            <Link to="/categories" className={iconBtn()} aria-label="Browse categories">
              <Menu className="size-[18px]" />
            </Link>
          )}
        </div>
        <Logo small={back} />
        <div className="flex items-center justify-end gap-2">
          {right ?? (
            <>
              <Link to="/shop" className={iconBtn()} aria-label="Search">
                <Search className="size-[18px]" />
              </Link>
              <CartButton />
            </>
          )}
        </div>
      </div>
      <div className="mx-auto mt-0 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" aria-hidden />
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
