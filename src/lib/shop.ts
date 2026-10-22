import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type ColorOpt = { name: string; hex: string };

export const colorsOf = (p: Pick<Product, "colors">): ColorOpt[] =>
  Array.isArray(p.colors) ? (p.colors as unknown as ColorOpt[]) : [];

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase.from("products").select("*").eq("active", true).order("created_at");
    if (error) throw error;
    return data;
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("sort");
    if (error) throw error;
    return data;
  },
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

// ---------- Cart ----------
export function useCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, color, product:products(*)")
        .order("created_at");
      if (error) throw error;
      return (data ?? []).filter((r) => r.product) as { id: string; quantity: number; color: string; product: Product }[];
    },
  });
}

export function useCartCount() {
  const { data } = useCart();
  return (data ?? []).reduce((s, i) => s + i.quantity, 0);
}

export function useAddToCart() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ product, color, quantity }: { product: Product; color: string; quantity: number }) => {
      if (!user) throw new Error("AUTH");
      if (product.stock <= 0) throw new Error("This item is out of stock");
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .eq("color", color)
        .maybeSingle();
      const next = Math.min((existing?.quantity ?? 0) + quantity, product.stock, 20);
      if (existing) {
        const { error } = await supabase.from("cart_items").update({ quantity: next }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: user.id, product_id: product.id, color, quantity: next });
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${v.product.name} added to cart`);
    },
    onError: (e: Error) => {
      if (e.message === "AUTH") {
        toast("Sign in to start your cart");
        navigate({ to: "/auth", search: { redirect: window.location.pathname } });
      } else toast.error(e.message);
    },
  });
}

export function useUpdateCartQty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- Wishlist ----------
export function useWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id, product:products(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).filter((r) => r.product) as { product_id: string; product: Product }[];
    },
  });
}

export function useToggleWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useWishlist();
  const ids = new Set((data ?? []).map((w) => w.product_id));
  const m = useMutation({
    mutationFn: async (product: Product) => {
      if (!user) throw new Error("AUTH");
      if (ids.has(product.id)) {
        const { error } = await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
      if (error) throw error;
      return true;
    },
    onSuccess: (added, p) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast(added ? `Saved ${p.name} to wishlist` : `Removed from wishlist`);
    },
    onError: (e: Error) => {
      if (e.message === "AUTH") {
        toast("Sign in to save favourites");
        navigate({ to: "/auth", search: { redirect: window.location.pathname } });
      } else toast.error(e.message);
    },
  });
  return { has: (id: string) => ids.has(id), toggle: m.mutate, pending: m.isPending };
}

// ---------- Orders ----------
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export const TIMELINE: OrderStatus[] = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
export const ALL_STATUSES: OrderStatus[] = ["pending", ...TIMELINE, "cancelled"];
