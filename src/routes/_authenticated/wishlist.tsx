import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/olyon/chrome";
import { ProductCard, ProductGridSkeleton } from "@/components/olyon/product-card";
import { EmptyState, PageTitle, btn } from "@/components/olyon/ui";
import { useWishlist } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Orrion" },
      { name: "description", content: "Products you've saved on Orrion." },
      { property: "og:title", content: "Wishlist — Orrion" },
      { property: "og:description", content: "Products you've saved on Orrion." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { data, isLoading } = useWishlist();
  return (
    <div>
      <AppHeader />
      <PageTitle title="Wishlist" sub={`${data?.length ?? 0} saved products`} />
      {!isLoading && !data?.length ? (
        <EmptyState icon={<Heart className="size-7" />} title="Nothing saved yet" text="Tap the heart on any product to keep it here."
          action={<Link to="/shop" className={btn()}>Discover products <ArrowRight className="size-4" /></Link>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? <ProductGridSkeleton /> : data!.map((w, i) => <ProductCard key={w.product_id} p={w.product} index={i} />)}
        </div>
      )}
    </div>
  );
}
