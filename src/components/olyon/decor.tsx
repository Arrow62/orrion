import type { ReactNode } from "react";
import leaves from "@/assets/tech-leaves.png";
import feather from "@/assets/tech-feather.png";
import { LivingMagpieScene } from "./living-magpie";

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

/** Page header whose background painting holds the living (animated) magpie. */
export function ForestPageHeader({ code, title, sub, children }: { code: string; title: string; sub?: string; children?: ReactNode }) {
  return (
    <section className="hud-glass corners relative mb-6 overflow-hidden rounded-[1.75rem]">
      {/* the painting, cropped onto the bird, fading into the panel */}
      <div className="absolute inset-y-0 right-0 w-[62%] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_45%)] md:w-[45%]">
        <LivingMagpieScene className="absolute -top-[95%] left-1/2 w-[150%] -translate-x-[42%] md:-top-[150%]" />
      </div>
      <div className="relative max-w-[62%] px-5 py-6 md:px-8 md:py-8">
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.25em] text-olive">
          <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle" />{code}
        </p>
        <h1 className="mt-2 text-[1.6rem] leading-tight md:text-4xl">{title}</h1>
        {sub ? <p className="mt-1 text-[0.8rem] text-muted-foreground">{sub}</p> : null}
        {children}
      </div>
    </section>
  );
}
