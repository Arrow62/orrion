import type { ReactNode } from "react";
import leaves from "@/assets/tech-leaves.png";
import feather from "@/assets/tech-feather.png";
import { AnimatedMagpie } from "./magpie";

/** Fixed atmospheric forest art behind every page. */
export function ForestBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <img src={leaves} alt="" width={1024} height={1024} loading="lazy"
        className="animate-sway absolute -right-24 -top-16 w-72 opacity-[0.14] md:w-[28rem]" />
      <img src={leaves} alt="" width={1024} height={1024} loading="lazy"
        className="absolute -bottom-24 -left-28 w-80 rotate-180 opacity-[0.10] md:w-[30rem]" />
      <img src={feather} alt="" width={1024} height={1024} loading="lazy"
        className="feather-float absolute left-[6%] top-[42%] w-16 opacity-25 md:w-24" />
    </div>
  );
}

/** Futuristic page header panel with the animated magpie. */
export function ForestPageHeader({ code, title, sub, children }: { code: string; title: string; sub?: string; children?: ReactNode }) {
  return (
    <section className="hud-glass corners relative mb-6 overflow-hidden rounded-[1.75rem] px-5 py-5 md:px-8 md:py-7">
      <div className="grid-lines absolute inset-0 opacity-40" />
      <img src={leaves} alt="" width={1024} height={1024} loading="lazy"
        className="pointer-events-none absolute -bottom-10 -left-8 w-36 opacity-40" />
      <div className="relative grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 md:grid-cols-[minmax(0,1fr)_10rem]">
        <div className="min-w-0">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.25em] text-olive">
            <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle" />{code}
          </p>
          <h1 className="mt-2 text-[1.6rem] leading-tight md:text-4xl">{title}</h1>
          {sub ? <p className="mt-1 text-[0.8rem] text-muted-foreground">{sub}</p> : null}
          {children}
        </div>
        <div className="relative">
          <div className="absolute inset-[18%] rounded-full border border-olive/30" />
          <div className="animate-orbit absolute inset-[8%] rounded-full border border-dashed border-primary/30" />
          <AnimatedMagpie className="relative w-full" />
        </div>
      </div>
    </section>
  );
}
