import galaxy from "@/assets/p-galaxy.jpg";
import mirror from "@/assets/p-mirror.jpg";
import blender from "@/assets/p-blender.jpg";
import diffuser from "@/assets/p-diffuser.jpg";
import planter from "@/assets/p-planter.jpg";
import earbuds from "@/assets/p-earbuds.jpg";
import silk from "@/assets/p-silk.jpg";
import tote from "@/assets/p-tote.jpg";

export const productImages: Record<string, string> = {
  galaxy,
  mirror,
  blender,
  diffuser,
  planter,
  earbuds,
  silk,
  tote,
};

export const imageKeys = Object.keys(productImages);

/** Resolve a product image key or absolute URL to a displayable src. */
export function productImage(key: string | null | undefined): string {
  if (!key) return galaxy;
  if (key.startsWith("http")) return key;
  return productImages[key] ?? galaxy;
}
