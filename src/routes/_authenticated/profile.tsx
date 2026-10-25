import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Heart, LogOut, Package, ShoppingBag } from "lucide-react";
import { AppHeader } from "@/components/olyon/chrome";
import { Btn } from "@/components/olyon/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Orrion" },
      { name: "description", content: "Manage your Orrion account." },
      { property: "og:title", content: "Your profile — Orrion" },
      { property: "og:description", content: "Manage your Orrion account." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const wl = useWishlist();
  const profile = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });
  const orders = useQuery({
    queryKey: ["orders-count", user?.id],
    queryFn: async () => (await supabase.from("orders").select("id", { count: "exact", head: true })).count ?? 0,
  });
  const name = profile.data?.full_name || user?.email?.split("@")[0] || "You";

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div>
      <AppHeader />
      <div className="flex items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-plum-gradient font-display text-3xl text-primary-foreground">{name[0]?.toUpperCase()}</div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl">{name}</h1>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          {isAdmin ? <span className="mt-1 inline-block rounded-full bg-olive px-2.5 py-0.5 text-xs font-semibold text-olive-foreground">Admin</span> : null}
        </div>
      </div>
      <div className="surface mt-6 grid grid-cols-2 divide-x divide-border rounded-3xl py-4 text-center">
        <div><p className="text-2xl font-semibold">{orders.data ?? "–"}</p><p className="text-xs text-muted-foreground">Total orders</p></div>
        <div><p className="text-2xl font-semibold">{wl.data?.length ?? "–"}</p><p className="text-xs text-muted-foreground">Wishlist</p></div>
      </div>
      <div className="surface mt-4 divide-y divide-border rounded-3xl">
        {[
          { to: "/cart" as const, icon: ShoppingBag, t: "My Cart", s: "Items waiting for checkout" },
          { to: "/wishlist" as const, icon: Heart, t: "Wishlist", s: "Your saved products" },
          { to: "/shop" as const, icon: Package, t: "Continue shopping", s: "Browse the full catalogue" },
        ].map((r) => (
          <Link key={r.t} to={r.to} className="flex items-center gap-4 p-4">
            <span className="grid size-11 place-items-center rounded-full bg-secondary"><r.icon className="size-5 text-olive" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">{r.t}</span><span className="text-xs text-muted-foreground">{r.s}</span></span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <Btn variant="outline" className="mt-5 w-full" onClick={signOut}><LogOut className="size-4" /> Log Out</Btn>
    </div>
  );
}
