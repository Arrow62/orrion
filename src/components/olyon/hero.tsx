import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import hero from "@/assets/hero.jpg";
import diffuser from "@/assets/p-diffuser.jpg";
import galaxy from "@/assets/p-galaxy.jpg";

const slides = [
  { code: "01", eyebrow: "Viral index", title: "Trending Products", text: "The internet's most-wanted, curated weekly.", img: hero, to: { sort: "popular" as const }, chip: "2.4k sold today" },
  { code: "02", eyebrow: "Forest calm", title: "Breathe Slower", text: "Diffusers and rituals for quieter evenings.", img: diffuser, to: { category: "home" }, chip: "Mist · 7h runtime" },
  { code: "03", eyebrow: "After dark", title: "Starlit Rooms", text: "Turn any room into a drifting galaxy.", img: galaxy, to: { q: "galaxy" }, chip: "360° projection" },
];
const DURATION = 6;

export function HeroOrbit() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const s = slides[i]!;

  // Ambient loops (once)
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("[data-float]", { y: -8, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.6 });
      gsap.to("[data-ring]", { rotate: 360, duration: 40, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
    }, root);
    return () => ctx.revert();
  }, []);

  // Slide timeline
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo("[data-img]", { clipPath: "circle(0% at 72% 50%)", scale: 1.15 }, { clipPath: "circle(85% at 72% 50%)", scale: 1, duration: 1.4, ease: "expo.inOut" })
        .fromTo("[data-char]", { yPercent: 110, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.025, ease: "expo.out" }, "-=0.7")
        .fromTo("[data-fade]", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.6")
        .fromTo("[data-code]", { autoAlpha: 0, x: 30 }, { autoAlpha: 0.12, x: 0, duration: 1, ease: "expo.out" }, "<");
      gsap.fromTo("[data-progress]", { scaleX: 0 }, {
        scaleX: 1, duration: DURATION, ease: "none", transformOrigin: "left center",
        onComplete: () => setI((n) => (n + 1) % slides.length),
      });
    }, root);
    return () => ctx.revert();
  }, [i]);

  return (
    <section ref={root} className="relative mt-1 overflow-hidden rounded-[1.75rem] border border-border bg-forest shadow-lift" aria-roledescription="carousel" aria-label="Featured collections">
      <div className="relative aspect-[5/6] sm:aspect-[16/10] md:aspect-[21/9]">
        <div className="absolute inset-0 grid-lines opacity-60" />
        <img key={s.img} data-img src={s.img} alt="" width={1280} height={896} className="absolute inset-0 size-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/50 to-transparent md:bg-hero-fade" />

        {/* orbit ring */}
        <svg data-ring viewBox="0 0 200 200" className="pointer-events-none absolute -right-16 top-6 size-72 text-olive/50" aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <circle cx="100" cy="4" r="3" className="fill-primary" />
        </svg>

        <span data-code className="pointer-events-none absolute -right-2 bottom-16 font-brand text-[9rem] leading-none text-foreground opacity-10 md:text-[13rem]">{s.code}</span>

        {/* floating chip */}
        <div data-float className="hud-glass absolute right-4 top-4 flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          <span key={s.chip} className="font-mono-ui text-[9px] uppercase text-foreground/80">{s.chip}</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 md:inset-y-0 md:flex md:max-w-md md:flex-col md:justify-center md:p-10">
          <p data-fade className="flex items-center gap-2 font-mono-ui text-[9px] uppercase text-olive">
            <span className="h-px w-6 bg-olive" /> {s.code} / {s.eyebrow}
          </p>
          <h1 key={s.title} className="mt-2 text-[1.9rem] leading-[1.02] text-foreground md:text-[2.6rem]">
            {s.title.split(" ").map((w, wi) => (
              <span key={wi} className="block overflow-hidden pb-0.5">
                {w.split("").map((c, ci) => (
                  <span key={ci} data-char className={`inline-block ${wi === 1 ? "italic text-primary-foreground/70" : ""}`}>{c}</span>
                ))}
              </span>
            ))}
          </h1>
          <p data-fade className="mt-2 max-w-[16rem] text-[0.8rem] leading-relaxed text-foreground/70">{s.text}</p>
          <div data-fade className="mt-4 flex items-center gap-3">
            <Link to="/shop" search={s.to}
              className="group inline-flex h-9 items-center gap-2 rounded-full bg-plum-gradient pl-4 pr-1 text-[0.78rem] font-semibold text-primary-foreground shadow-glow active:scale-95">
              Explore
              <span className="grid size-7 place-items-center rounded-full bg-background/25 transition-transform group-hover:rotate-45"><ArrowUpRight className="size-3.5" /></span>
            </Link>
            <div className="flex gap-1.5">
              {slides.map((x, n) => (
                <button key={x.code} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`}
                  className={`relative h-1 overflow-hidden rounded-full bg-foreground/20 transition-all ${n === i ? "w-10" : "w-4"}`}>
                  {n === i ? <span data-progress className="absolute inset-0 bg-foreground" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
