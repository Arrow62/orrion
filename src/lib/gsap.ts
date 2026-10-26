import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Page enter + scroll reveals for any element with [data-reveal] inside the container. Re-runs on `key`. */
export function usePageMotion(ref: RefObject<HTMLElement | null>, key: string) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { autoAlpha: 0, y: 14, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out", clearProps: "filter,transform" });
      // reveal targets appear in DOM lazily (queries), so observe mutations
      const seen = new WeakSet<Element>();
      const scan = () => {
        const items = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]")).filter((n) => !seen.has(n));
        if (!items.length) return;
        items.forEach((n) => seen.add(n));
        gsap.set(items, { autoAlpha: 0, y: 28 });
        ScrollTrigger.batch(items, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.07, overwrite: true }),
        });
        ScrollTrigger.refresh();
      };
      scan();
      const mo = new MutationObserver(() => requestAnimationFrame(scan));
      mo.observe(el, { childList: true, subtree: true });
      return () => mo.disconnect();
    }, el);
    return () => ctx.revert();
  }, [key]);
}

/** Subtle 3D tilt that follows the pointer. */
export function useTilt(ref: RefObject<HTMLElement | null>, strength = 8) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !window.matchMedia("(hover: hover)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: x * strength, rotateX: -y * strength, transformPerspective: 800, duration: 0.5, ease: "power3.out" });
      el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    };
    const leave = () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
}
