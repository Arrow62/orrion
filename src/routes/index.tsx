import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Leaf, Search, Sparkles, Ticket } from "lucide-react";
import { categoryIcon } from "@/lib/category-icons";
import { useEffect, useState } from "react";
import { AppHeader, ForestFooter } from "@/components/olyon/chrome";
import { ProductCard, ProductGridSkeleton } from "@/components/olyon/product-card";
import { SectionTitle, Skel } from "@/components/olyon/ui";
import { categoriesQuery, productsQuery } from "@/lib/shop";
import hero from "@/assets/hero.jpg";
import diffuser from "@/assets/p-diffuser.jpg";
import galaxy from "@/assets/p-galaxy.jpg";

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


const slides = [
  { eyebrow: "Viral on Instagram", title: ["Trending", "Products"], text: "Discover the most viral products, all in one place.", img: hero, to: { sort: "popular" as const } },
  { eyebrow: "Forest calm", title: ["Breathe", "Slower"], text: "Diffusers and rituals for quieter evenings.", img: diffuser, to: { category: "home" } },
  { eyebrow: "After dark", title: ["Starlit", "Rooms"], text: "Turn any room into a drifting galaxy.", img: galaxy, to: { q: "galaxy" } },
];

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [slide, setSlide] = useState(0);
  const products = useQuery(productsQuery);
  const cats = useQuery(categoriesQuery);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const featured = (products.data ?? []).filter((p) => p.featured);
  const trending = (products.data ?? []).filter((p) => p.trending);
  const s = slides[slide]!;

  return (
    <div>
      <AppHeader />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/shop", search: { q: q.trim() || undefined } });
        }}
        className="surface flex h-14 items-center gap-3 rounded-full pl-5 pr-1.5"
      >
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search viral products…" aria-label="Search products"
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/80" />
        <button type="submit" aria-label="Search" className="grid size-11 shrink-0 place-items-center rounded-full bg-olive text-olive-foreground active:scale-90">
          <ArrowRight className="size-5" />
        </button>
      </form>

      {/* Hero */}
      <section className="relative mt-5 overflow-hidden rounded-[2rem] bg-forest shadow-lift" aria-roledescription="carousel">
        <div className="relative aspect-[4/3] md:aspect-[21/9]">
          <AnimatePresence mode="sync">
            <motion.img key={s.img} src={s.img} alt="" width={1280} height={896}
              initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 size-full object-cover object-right" />
          </AnimatePresence>
          <div className="absolute inset-0 bg-hero-fade" />
          <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12">
            <motion.div key={slide} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="max-w-[62%] text-primary-foreground md:max-w-md">
              <p className="eyebrow opacity-90">{s.eyebrow}</p>
              <h1 className="mt-3 text-[2.6rem] leading-[0.95] md:text-6xl">{s.title[0]}<br />{s.title[1]}</h1>
              <p className="mt-3 text-sm opacity-85 md:text-base">{s.text}</p>
              <Link to="/shop" search={s.to}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-primary-foreground/25 bg-olive/90 px-5 text-sm font-semibold backdrop-blur active:scale-95">
                Shop Now <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </div>
          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 text-primary-foreground">
            <span className="text-[11px] font-semibold">0{slide + 1}</span>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
                className={`w-1 rounded-full transition-all ${i === slide ? "h-8 bg-primary-foreground" : "h-3 bg-primary-foreground/40"}`} />
            ))}
          </div>
        </div>
      </section>

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
                    <span className="surface grid size-16 place-items-center rounded-full transition-transform group-active:scale-90 group-hover:-translate-y-0.5">
                      <Icon className="size-6 text-olive" strokeWidth={1.6} />
                    </span>
                    <span className="mt-2 text-[11px] leading-tight text-foreground">{a}{b ? <><br />& {b}</> : null}</span>
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

      {/* Promo */}
      <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-plum-gradient p-6 text-primary-foreground shadow-lift md:p-10">
        <Leaf className="absolute -right-6 -top-6 size-40 rotate-12 animate-sway opacity-10" />
        <p className="eyebrow opacity-80">Forest offer</p>
        <h2 className="mt-2 text-3xl md:text-4xl">10% off your first ritual</h2>
        <p className="mt-2 text-sm opacity-80">Use code at checkout on orders above ₹999.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center gap-2 rounded-full border border-dashed border-primary-foreground/40 px-4 font-brand text-sm tracking-widest">
            <Ticket className="size-4" /> FOREST10
          </span>
          <Link to="/shop" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-foreground px-5 text-sm font-semibold text-primary active:scale-95">
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
      <ForestFooter />
    </div>
  );
}
