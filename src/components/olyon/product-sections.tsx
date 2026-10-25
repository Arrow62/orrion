import { useState } from "react";
import { Box, CalendarClock, ChevronDown, MapPin, RotateCcw, Sparkle } from "lucide-react";
import type { Product } from "@/lib/shop";
import { colorsOf } from "@/lib/shop";
import { SectionTitle, Stars } from "./ui";
import { cn } from "@/lib/utils";

export function Highlights({ p }: { p: Product }) {
  const specs = [
    ["Category", p.category[0]!.toUpperCase() + p.category.slice(1)],
    ["Colours", colorsOf(p).map((c) => c.name).join(", ") || "—"],
    ["Availability", p.stock > 0 ? `${p.stock} in stock` : "Out of stock"],
    ["Payment", "Cash on Delivery"],
  ];
  return (
    <section className="mt-12 grid gap-4 md:grid-cols-2">
      <div className="surface rounded-3xl p-5">
        <SectionTitle>Key Highlights</SectionTitle>
        <ul className="space-y-3">
          {p.features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm"><Sparkle className="size-4 shrink-0 fill-olive text-olive" />{f}</li>
          ))}
        </ul>
      </div>
      <div className="surface rounded-3xl p-5">
        <SectionTitle>Specifications</SectionTitle>
        <dl className="divide-y divide-border text-sm">
          {specs.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 py-2.5">
              <dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function DeliveryInfo() {
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(pin)) { setMsg("Enter a valid 6-digit PIN code"); return; }
    const d = new Date(); d.setDate(d.getDate() + 6);
    setMsg(`Delivery to ${pin} by ${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} (standard). Cash on Delivery available.`);
  };
  return (
    <section className="surface mt-4 rounded-3xl p-5">
      <SectionTitle>Delivery & Returns</SectionTitle>
      <form onSubmit={check} className="flex gap-2">
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-background px-4">
          <MapPin className="size-4 text-muted-foreground" />
          <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" maxLength={6} placeholder="Enter PIN code" aria-label="PIN code" className="min-w-0 flex-1 bg-transparent outline-none" />
        </label>
        <button className="h-12 rounded-full bg-olive px-5 text-sm font-semibold text-olive-foreground">Check</button>
      </form>
      {msg ? <p className="mt-3 text-sm text-muted-foreground">{msg}</p> : null}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[{ i: CalendarClock, t: "Ships in 24h" }, { i: RotateCcw, t: "7-day returns" }, { i: Box, t: "Secure packaging" }].map(({ i: I, t }) => (
          <div key={t} className="rounded-2xl bg-secondary p-3"><I className="mx-auto mb-1.5 size-5 text-olive" />{t}</div>
        ))}
      </div>
    </section>
  );
}

export function RatingsSummary({ p }: { p: Product }) {
  const r = Number(p.rating);
  // Distribution derived from the average rating; individual reviews are not stored yet.
  const weights = [5, 4, 3, 2, 1].map((s) => Math.max(0.02, 1 - Math.abs(s - r) / 2.2));
  const sum = weights.reduce((a, b) => a + b, 0);
  return (
    <section className="surface mt-4 rounded-3xl p-5">
      <SectionTitle>Ratings</SectionTitle>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-6">
        <div className="text-center">
          <p className="font-display text-5xl">{r.toFixed(1)}</p>
          <Stars rating={r} className="mt-1 justify-center" />
          <p className="mt-1 text-xs text-muted-foreground">{p.reviews.toLocaleString("en-IN")} ratings</p>
        </div>
        <div className="space-y-1.5">
          {weights.map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3">{5 - i}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-olive" style={{ width: `${(w / sum) * 100}%` }} /></span>
              <span className="w-9 text-right text-muted-foreground">{Math.round((w / sum) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductFaq({ p }: { p: Product }) {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    ["Is Cash on Delivery available?", "Yes — every order on Orrion can be paid in cash when it arrives."],
    ["How long does delivery take?", "Standard delivery takes 5–7 business days (free above ₹999). Express takes 2–3 days for ₹99."],
    ["Can I return it?", `If your ${p.name} isn't right, you can request a return within 7 days of delivery.`],
    ["Can I cancel my order?", "Orders can be cancelled before they are packed."],
  ];
  return (
    <section className="surface mt-4 rounded-3xl p-5">
      <SectionTitle>Questions & Answers</SectionTitle>
      <div className="divide-y divide-border">
        {faqs.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-3 py-3.5 text-left text-sm font-semibold">
              {q}<ChevronDown className={cn("size-4 shrink-0 transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i ? <p className="pb-4 text-sm text-muted-foreground">{a}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
