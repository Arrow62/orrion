import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Address } from "@/lib/shop";
import { Btn } from "./ui";

export const addressSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the recipient's name").max(80),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
  line1: z.string().trim().min(3, "Enter house no. and street").max(160),
  city: z.string().trim().min(2, "Enter city").max(60),
  state: z.string().trim().min(2, "Enter state").max(60),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit PIN code"),
});

export function AddressForm({ initial, onDone, onCancel }: { initial?: Address | undefined; onDone: (a: Address) => void; onCancel?: (() => void) | undefined }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [v, setV] = useState({
    full_name: initial?.full_name ?? "", phone: initial?.phone ?? "", line1: initial?.line1 ?? "",
    city: initial?.city ?? "", state: initial?.state ?? "", pincode: initial?.pincode ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = addressSchema.safeParse(v);
    if (!p.success) {
      setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const q = initial
      ? supabase.from("addresses").update(p.data).eq("id", initial.id).select().single()
      : supabase.from("addresses").insert({ ...p.data, user_id: user!.id }).select().single();
    const { data, error } = await q;
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["addresses"] });
    toast.success("Address saved");
    onDone(data);
  };

  const input = (k: keyof typeof v, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input value={v[k]} onChange={(e) => setV((s) => ({ ...s, [k]: e.target.value }))} {...props}
        className={`h-12 w-full rounded-2xl border bg-surface px-4 outline-none focus:border-olive ${errors[k] ? "border-destructive" : "border-border"}`} />
      {errors[k] ? <span className="mt-1 block text-xs text-destructive">{errors[k]}</span> : null}
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        {input("full_name", "Full name", { autoComplete: "name" })}
        {input("phone", "Phone (10 digits)", { inputMode: "numeric", maxLength: 10, autoComplete: "tel-national" })}
      </div>
      {input("line1", "House no., street, area", { autoComplete: "street-address" })}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {input("city", "City", { autoComplete: "address-level2" })}
        {input("state", "State", { autoComplete: "address-level1" })}
        {input("pincode", "PIN code", { inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
      </div>
      <div className="flex gap-2 pt-1">
        <Btn type="submit" loading={busy}>Save address</Btn>
        {onCancel ? <Btn type="button" variant="ghost" onClick={onCancel}>Cancel</Btn> : null}
      </div>
    </form>
  );
}
