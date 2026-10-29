import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Leaf, Search, Sparkles, Ticket } from "lucide-react";
import { categoryIcon } from "@/lib/category-icons";
import { useState } from "react";
import { AppHeader, ForestFooter } from "@/components/olyon/chrome";
import { ProductCard, ProductGridSkeleton } from "@/components/olyon/product-card";
import { SectionTitle, Skel } from "@/components/olyon/ui";
import { BestSellers, DealOfDay, SpotlightBanners, EditorialBanners, NewArrivals, TrustStrip } from "@/components/olyon/home-sections";
import { HeroOrbit } from "@/components/olyon/hero";
import { categoriesQuery, productsQuery } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orrion — Trending today, yours tomorrow" },
      { name: "description", content: "Shop viral gadgets, home essentials and self-care finds with free shipping above ₹999 and cash on delivery." },
      { property: "og:title", content: "Orrion — Trending today, yours tomorrow" },
      { property: "og:description", content: "Viral gadgets, home and self-care finds. Cash on delivery across India." },
    ],
  }),
  component: Home,
});


function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const products = useQuery(productsQuery);
  const cats = useQuery(categoriesQuery);


  const featured = (products.data ?? []).filter((p) => p.featured);
  const trending = (products.data ?? []).filter((p) => p.trending);

  return (
    <div>
      <AppHeader />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/shop", search: { q: q.trim() || undefined } });
        }}
        className="hud-glass mb-4 flex h-11 items-center gap-2.5 rounded-full pl-4 pr-1"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search viral products…" aria-label="Search products"
          className="h-full min-w-0 flex-1 bg-transparent text-[0.82rem] outline-none placeholder:text-muted-foreground/80" />
        <button type="submit" aria-label="Search" className="grid size-9 shrink-0 place-items-center rounded-full bg-olive text-olive-foreground active:scale-90">
          <ArrowRight className="size-4" />
        </button>
      </form>

      <HeroOrbit />
      {products.data ? <SpotlightBanners products={products.data} /> : null}

      {/* Categories */}
      <section className="mt-8" aria-label="Categories">
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:px-0">
          {cats.isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} className="h-28 w-[4.75rem] shrink-0" />)
            : (cats.data ?? []).map((c) => {
                const Icon = categoryIcon[c.icon] ?? Sparkles;
                const [a, b] = c.name.split(" & ");
                return (
                  <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group flex w-[4.75rem] shrink-0 flex-col items-center text-center md:w-auto">
                    <span className="hud-glass grid size-14 place-items-center rounded-2xl transition-transform group-active:scale-90 group-hover:-translate-y-0.5">
                      <Icon className="size-5 text-olive" strokeWidth={1.6} />
                    </span>
                    <span className="mt-2 text-[10px] leading-tight text-muted-foreground text-foreground">{a}{b ? <><br />& {b}</> : null}</span>
                  </Link>
                );
              })}
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle action={<Link to="/shop" search={{ featured: true }} className="flex items-center gap-1 text-sm font-semibold text-olive">View All <ArrowRight className="size-4" /></Link>}>
          Featured Products
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {products.isLoading ? <ProductGridSkeleton n={4} /> : featured.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      </section>

      {products.data ? <DealOfDay products={products.data} /> : null}
      <EditorialBanners />
      {products.data ? <NewArrivals products={products.data} /> : null}

      {/* Promo */}
      <section data-reveal className="relative mt-10 overflow-hidden rounded-[2rem] bg-plum-gradient p-6 text-primary-foreground shadow-lift md:p-10">
        <Leaf className="absolute -right-6 -top-6 size-40 rotate-12 animate-sway opacity-10" />
        <p className="eyebrow opacity-80">Forest offer</p>
        <h2 className="mt-2 text-2xl md:text-3xl">10% off your first ritual</h2>
        <p className="mt-2 text-sm opacity-80">Use code at checkout on orders above ₹999.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center gap-2 rounded-full border border-dashed border-primary-foreground/40 px-4 font-brand text-sm tracking-widest">
            <Ticket className="size-4" /> FOREST10
          </span>
          <Link to="/shop" className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background active:scale-95">
            Start shopping <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle action={<Link to="/shop" search={{ trending: true }} className="flex items-center gap-1 text-sm font-semibold text-olive">View All <ArrowRight className="size-4" /></Link>}>
          Trending Now
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {products.isLoading ? <ProductGridSkeleton n={4} /> : trending.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      </section>
      {products.data ? <BestSellers products={products.data} /> : null}
      <TrustStrip />
      <ForestFooter />
    </div>
  );
}
