import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/olyon/chrome";
import { ForestPageHeader } from "@/components/olyon/decor";
import { Skel } from "@/components/olyon/ui";
import { categoriesQuery, productsQuery } from "@/lib/shop";
import { productImage } from "@/lib/images";
import { inr } from "@/lib/pricing";
import { categoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Orrion" },
      { name: "description", content: "Browse Orrion by category: home, tech, beauty, wellness, fashion and gifts." },
      { property: "og:title", content: "Categories — Orrion" },
      { property: "og:description", content: "Browse Orrion by category." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Categories,
});

function Categories() {
  const cats = useQuery(categoriesQuery);
  const products = useQuery(productsQuery);
  const all = products.data ?? [];
  return (
    <div>
      <AppHeader />
      <ForestPageHeader code={`Collections · ${cats.data?.length ?? 0}`} title="Categories" sub="Wander through the collection" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cats.isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} className={cn("h-48", i === 0 && "col-span-2 h-60")} />)
          : (cats.data ?? []).map((c, i) => {
              const Icon = categoryIcon[c.icon] ?? Sparkles;
              const items = all.filter((p) => p.category === c.slug);
              const cover = items[0];
              const from = items.length ? Math.min(...items.map((p) => p.price)) : null;
              const big = i % 5 === 0;
              return (
                <Link key={c.slug} to="/shop" search={{ category: c.slug }} data-reveal
                  className={cn("group relative overflow-hidden rounded-2xl border border-border bg-surface", big ? "col-span-2 h-60 md:h-72" : "h-48 md:h-60")}>
                  {cover ? (
                    <img src={productImage(cover.image)} alt="" loading="lazy" width={600} height={600}
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-xl bg-background/60 text-olive backdrop-blur"><Icon className="size-4" /></span>
                  <span className="absolute right-3 top-3 font-mono-ui text-[10px] text-foreground/70">{String(i + 1).padStart(2, "0")}</span>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
                    <div className="min-w-0">
                      <h2 className={cn("truncate font-semibold", big ? "text-xl" : "text-[0.95rem]")}>{c.name}</h2>
                      <p className="text-[11px] text-muted-foreground">
                        {items.length} products{from !== null ? ` · from ${inr(from)}` : ""}
                      </p>
                      {big && items.length > 1 ? (
                        <div className="mt-2 flex -space-x-2">
                          {items.slice(1, 5).map((p) => (
                            <img key={p.id} src={productImage(p.image)} alt="" loading="lazy" width={32} height={32} className="size-8 rounded-full object-cover ring-2 ring-background" />
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-olive text-olive-foreground transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
