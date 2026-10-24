import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Home, LayoutGrid, Search, ShoppingBag, Sparkle, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCartCount } from "@/lib/shop";
import { Badge, iconBtn } from "./ui";
import forestMist from "@/assets/forest-mist.jpg";

export function Logo({ tagline = "Trending today ✦ Yours tomorrow", small }: { tagline?: string | undefined; small?: boolean | undefined }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Orrion home">
      <Sparkle className={cn("shrink-0 fill-primary text-primary", small ? "size-5" : "size-6")} />
      <span className="min-w-0">
        <span className={cn("block font-brand leading-none tracking-[0.18em] text-primary", small ? "text-lg" : "text-[1.55rem]")}>
          ORRION
        </span>
        {tagline ? (
          <span className="mt-1 block truncate text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function CartButton() {
  const count = useCartCount();
  return (
    <Link to="/cart" className={iconBtn({ variant: "plum" })} aria-label={`Cart, ${count} items`}>
      <ShoppingBag className="size-5" />
      <Badge count={count} />
    </Link>
  );
}

export function AppHeader({ back, right, tagline }: { back?: boolean; right?: ReactNode; tagline?: string | undefined }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 bg-background/75 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.9rem)] backdrop-blur-xl md:-mx-6 md:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {back ? (
            <button onClick={() => router.history.back()} className={iconBtn()} aria-label="Go back">
              <ArrowLeft className="size-5" />
            </button>
          ) : null}
          <Logo tagline={tagline} small={back} />
        </div>
        <div className="flex items-center gap-2.5">
          {right ?? (
            <>
              <Link to="/shop" className={iconBtn()} aria-label="Search">
                <Search className="size-5" />
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
      <Link to={t.to} className="relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium" aria-current={active ? "page" : undefined}>
        <t.icon className={cn("size-[22px] transition-colors", active ? "fill-olive/90 text-olive" : "text-muted-foreground")} strokeWidth={1.7} />
        <span className={active ? "text-foreground" : "text-muted-foreground"}>{t.label}</span>
        {active ? <motion.span layoutId="nav-dot" className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-olive" /> : null}
      </Link>
    );
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]" aria-label="Main">
      <div className="surface relative mx-auto flex max-w-md items-end rounded-[2rem] px-2 pb-1 pt-1.5 backdrop-blur-xl md:max-w-lg">
        <Tab t={tabs[0]} />
        <Tab t={tabs[1]} />
        <div className="flex flex-1 justify-center">
          <Link to="/cart" aria-label={`Cart, ${count} items`}
            className="relative -mt-9 grid size-16 place-items-center rounded-full bg-plum-gradient text-primary-foreground shadow-glow ring-4 ring-background transition-transform active:scale-90">
            <ShoppingBag className="size-6" />
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
    <div className="pointer-events-none relative mt-10 h-32 overflow-hidden" aria-hidden>
      <img src={forestMist} alt="" loading="lazy" width={1024} height={640}
        className="absolute inset-x-0 bottom-0 w-full object-cover opacity-60 [mask-image:linear-gradient(to_top,black,transparent)]" />
      <p className="relative pt-4 text-center eyebrow text-muted-foreground">{text}</p>
    </div>
  );
}
