import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AppHeader } from "@/components/olyon/chrome";
import { ProductCard, ProductGridSkeleton } from "@/components/olyon/product-card";
import { Btn, EmptyState } from "@/components/olyon/ui";
import { categoriesQuery, productsQuery } from "@/lib/shop";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["popular", "new", "price-asc", "price-desc", "rating"]).optional(),
  inStock: z.boolean().optional(),
  max: z.number().optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop all products — Orrion" },
      { name: "description", content: "Search, filter and sort Orrion's catalogue of viral gadgets, home and self-care products." },
      { property: "og:title", content: "Shop all products — Orrion" },
      { property: "og:description", content: "Search and filter viral finds on Orrion." },
    ],
  }),
  component: Shop,
});

const sorts = [
  { v: "popular", l: "Popular" },
  { v: "new", l: "Newest" },
  { v: "price-asc", l: "Price: Low" },
  { v: "price-desc", l: "Price: High" },
  { v: "rating", l: "Top rated" },
] as const;

function Shop() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const products = useQuery(productsQuery);
  const cats = useQuery(categoriesQuery);
  const [q, setQ] = useState(s.q ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => setQ(s.q ?? ""), [s.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if ((s.q ?? "") !== q) navigate({ search: (p) => ({ ...p, q: q || undefined }), replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    let l = [...(products.data ?? [])];
    const term = (s.q ?? "").toLowerCase().trim();
    if (term) l = l.filter((p) => [p.name, p.tagline, p.description, p.category].some((x) => x.toLowerCase().includes(term)));
    if (s.category) l = l.filter((p) => p.category === s.category);
    if (s.inStock) l = l.filter((p) => p.stock > 0);
    if (s.max) l = l.filter((p) => p.price <= s.max!);
    if (s.featured) l = l.filter((p) => p.featured);
    if (s.trending) l = l.filter((p) => p.trending);
    const sort = s.sort ?? "popular";
    l.sort((a, b) =>
      sort === "price-asc" ? a.price - b.price
      : sort === "price-desc" ? b.price - a.price
      : sort === "rating" ? Number(b.rating) - Number(a.rating)
      : sort === "new" ? b.created_at.localeCompare(a.created_at)
      : b.reviews - a.reviews,
    );
    return l;
  }, [products.data, s]);

  const catName = cats.data?.find((c) => c.slug === s.category)?.name;
  const activeFilters = [s.inStock, s.max, s.featured, s.trending].filter(Boolean).length;

  return (
    <div>
      <AppHeader back tagline="" />
      <h1 className="text-4xl">{catName ?? (s.featured ? "Featured" : s.trending ? "Trending" : "Discover")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{products.isLoading ? "Loading…" : `${list.length} products`}</p>

      <div className="mt-4 flex gap-2">
        <label className="surface flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full px-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products"
            className="h-full min-w-0 flex-1 bg-transparent outline-none" />
          {q ? <button onClick={() => setQ("")} aria-label="Clear search"><X className="size-4" /></button> : null}
        </label>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Filters"
          className={cn("relative grid size-12 shrink-0 place-items-center rounded-full", open ? "bg-olive text-olive-foreground" : "surface")}>
          <SlidersHorizontal className="size-5" />
          {activeFilters ? <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{activeFilters}</span> : null}
        </button>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        <Chip active={!s.category} onClick={() => navigate({ search: (p) => ({ ...p, category: undefined }) })}>All</Chip>
        {(cats.data ?? []).map((c) => (
          <Chip key={c.slug} active={s.category === c.slug} onClick={() => navigate({ search: (p) => ({ ...p, category: c.slug }) })}>
            {c.name}
          </Chip>
        ))}
      </div>

      {open ? (
        <div className="surface mt-3 space-y-4 rounded-3xl p-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {sorts.map((o) => (
                <Chip key={o.v} active={(s.sort ?? "popular") === o.v} onClick={() => navigate({ search: (p) => ({ ...p, sort: o.v }) })}>{o.l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max price</p>
            <div className="flex flex-wrap gap-2">
              {[undefined, 999, 1999, 2999].map((m) => (
                <Chip key={m ?? 0} active={s.max === m} onClick={() => navigate({ search: (p) => ({ ...p, max: m }) })}>{m ? `Under ₹${m}` : "Any"}</Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={!!s.inStock} onClick={() => navigate({ search: (p) => ({ ...p, inStock: p.inStock ? undefined : true }) })}>In stock only</Chip>
            {activeFilters ? (
              <Btn variant="ghost" size="sm" onClick={() => navigate({ search: (p) => ({ q: p.q, category: p.category, sort: p.sort }) })}>Clear filters</Btn>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.isLoading ? <ProductGridSkeleton n={6} /> : list.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>
      {!products.isLoading && list.length === 0 ? (
        <EmptyState icon={<PackageSearch className="size-7" />} title="Nothing found" text="Try another search term or clear your filters."
          action={<Link to="/shop" className="font-semibold text-olive">Reset search</Link>} />
      ) : null}
    </div>
  );
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={cn("h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
        active ? "bg-olive text-olive-foreground" : "border border-border bg-surface text-foreground hover:bg-secondary")}>
      {children}
    </button>
  );
}
