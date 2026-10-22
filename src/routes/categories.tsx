import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/olyon/chrome";
import { PageTitle, Skel } from "@/components/olyon/ui";
import { categoriesQuery, productsQuery } from "@/lib/shop";
import { productImage } from "@/lib/images";
import { categoryIcon } from "./index";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Olyon" },
      { name: "description", content: "Browse Olyon by category: home, tech, beauty, wellness, fashion and gifts." },
      { property: "og:title", content: "Categories — Olyon" },
      { property: "og:description", content: "Browse Olyon by category." },
    ],
  }),
  component: Categories,
});

function Categories() {
  const cats = useQuery(categoriesQuery);
  const products = useQuery(productsQuery);
  return (
    <div>
      <AppHeader />
      <PageTitle title="Categories" sub="Wander through the collection" />
      <div className="grid gap-3 md:grid-cols-2">
        {cats.isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} className="h-28" />)
          : (cats.data ?? []).map((c) => {
              const Icon = categoryIcon[c.icon] ?? Sparkles;
              const items = (products.data ?? []).filter((p) => p.category === c.slug);
              return (
                <Link key={c.slug} to="/shop" search={{ category: c.slug }}
                  className="surface group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl p-4 transition-transform active:scale-[0.98]">
                  <span className="grid size-14 place-items-center rounded-2xl bg-olive-soft text-olive"><Icon className="size-6" /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-semibold">{c.name}</span>
                    <span className="text-sm text-muted-foreground">{items.length} products</span>
                  </span>
                  <span className="flex items-center -space-x-3">
                    {items.slice(0, 2).map((p) => (
                      <img key={p.id} src={productImage(p.image)} alt="" loading="lazy" width={48} height={48} className="size-12 rounded-full object-cover ring-2 ring-surface" />
                    ))}
                    <ArrowRight className="ml-4 size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
