import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Minus, Plus, Sparkle, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const btn = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        plum: "bg-plum-gradient text-primary-foreground shadow-glow hover:brightness-110",
        olive: "bg-olive text-olive-foreground hover:brightness-110",
        outline: "border border-border bg-surface text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
        soft: "bg-olive-soft text-accent-foreground hover:brightness-95",
        danger: "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-12 px-6 text-[0.95rem]",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "plum", size: "md" },
  },
);

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof btn> & { loading?: boolean };
export const Btn = forwardRef<HTMLButtonElement, BtnProps>(
  ({ className, variant, size, loading, children, disabled, ...p }, ref) => (
    <button ref={ref} className={cn(btn({ variant, size }), className)} disabled={disabled || loading} {...p}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  ),
);
Btn.displayName = "Btn";

export const iconBtn = cva(
  "relative inline-grid size-11 shrink-0 place-items-center rounded-full transition-all active:scale-90",
  {
    variants: {
      variant: {
        surface: "surface text-foreground hover:bg-secondary",
        plum: "bg-plum-gradient text-primary-foreground shadow-glow",
        glass: "bg-surface/80 text-foreground backdrop-blur",
      },
    },
    defaultVariants: { variant: "surface" },
  },
);

export function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-olive px-1 text-[10px] font-bold text-olive-foreground ring-2 ring-background">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function QtyStepper({
  value, onChange, min = 1, max = 20, size = "md",
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-9" : "h-11";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-surface", h)}>
      <button aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={value <= min}
        className="grid h-full w-9 place-items-center rounded-l-full text-foreground disabled:opacity-30 hover:bg-secondary">
        <Minus className="size-4" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button aria-label="Increase quantity" onClick={() => onChange(value + 1)} disabled={value >= max}
        className="grid h-full w-9 place-items-center rounded-r-full text-foreground disabled:opacity-30 hover:bg-secondary">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-4", i <= Math.round(rating) ? "fill-olive text-olive" : "text-border")} />
      ))}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-sans eyebrow text-foreground">
        <Sparkle className="size-3.5 fill-olive text-olive" /> {children}
      </h2>
      {action}
    </div>
  );
}

export function PageTitle({ title, sub, aside }: { title: string; sub?: string; aside?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <h1 className="text-[1.7rem] leading-tight md:text-4xl">{title}</h1>
        {sub ? <p className="mt-1 text-muted-foreground">{sub}</p> : null}
      </div>
      {aside}
    </div>
  );
}

export function Pill({ children, tone = "olive" }: { children: ReactNode; tone?: "olive" | "plum" | "muted" | "danger" }) {
  const t = {
    olive: "bg-olive text-olive-foreground",
    plum: "bg-plum-soft text-primary",
    muted: "bg-secondary text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", t)}>{children}</span>;
}

export function Field({
  icon, error, className, ...p
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode | undefined; error?: string | undefined }) {
  return (
    <label className={cn("block", className)}>
      <span className={cn(
        "flex h-14 items-center gap-3 rounded-full border bg-surface px-5 transition-colors focus-within:border-olive",
        error ? "border-destructive" : "border-border",
      )}>
        {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}
        <input className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-muted-foreground/80" {...p} />
      </span>
      {error ? <span className="mt-1 block px-5 text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

export function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-secondary", className)} />;
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center rounded-3xl px-6 py-14 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-olive-soft text-olive">{icon}</div>
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{text}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
