import { Sparkle } from "lucide-react";
import { useEffect, useState } from "react";
import { LivingMagpieScene } from "./living-magpie";

/**
 * The splash fades itself out with pure CSS (splash-auto-hide), so it can
 * never block the app even if scripts are slow or fail to load.
 * JS only removes it from the page afterwards.
 */
export function Splash() {
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    const seen = sessionStorage.getItem("orrion-splash");
    const t = setTimeout(() => {
      sessionStorage.setItem("orrion-splash", "1");
      setMounted(false);
    }, seen ? 0 : 3400);
    return () => clearTimeout(t);
  }, []);
  if (!mounted) return null;
  return (
    <div className="splash-auto-hide fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-[rgb(248,245,230)] py-[8vh]"
      role="status" aria-label="Loading Orrion">
      <LivingMagpieScene eager
        className="absolute left-1/2 top-1/2 w-[max(100vw,75vh)] -translate-x-1/2 -translate-y-1/2" />
      <div className="relative text-center">
        <div className="flex items-center justify-center gap-3">
          <Sparkle className="size-5 fill-primary text-primary" />
          <span className="font-brand text-2xl tracking-[0.3em] text-background">ORRION</span>
        </div>
        <p className="mt-2 eyebrow text-olive">Trending today ✦ Yours tomorrow</p>
      </div>
      <div className="relative flex flex-col items-center gap-3">
        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-background/15">
          <div className="splash-bar h-full bg-primary" />
        </div>
        <p className="eyebrow text-background/60">Loading your next favourite finds</p>
      </div>
    </div>
  );
}
