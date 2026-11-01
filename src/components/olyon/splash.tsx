import { Sparkle } from "lucide-react";
import { useEffect, useState } from "react";
import bird from "@/assets/splash-bird.jpg";
import { AnimatedMagpie } from "./magpie";

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
    <div className="splash-auto-hide fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-background py-[10vh]"
      role="status" aria-label="Loading Orrion">
      <img src={bird} alt="" width={768} height={1024} className="absolute inset-0 size-full object-cover opacity-35 blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />
      <div className="relative text-center">
        <div className="flex items-center justify-center gap-3">
          <Sparkle className="size-6 fill-primary text-primary" />
          <span className="font-brand text-3xl tracking-[0.3em] text-foreground">ORRION</span>
        </div>
        <p className="mt-3 eyebrow text-olive">Trending today ✦ Yours tomorrow</p>
      </div>
      <div className="relative w-[78vw] max-w-sm">
        <div className="absolute inset-x-[10%] bottom-[16%] h-6 rounded-full bg-olive/30 blur-2xl" />
        <AnimatedMagpie eager className="w-full" />
      </div>
      <div className="relative flex flex-col items-center gap-3">
        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-border">
          <div className="splash-bar h-full bg-primary" />
        </div>
        <p className="eyebrow text-muted-foreground">Loading your next favourite finds</p>
      </div>
    </div>
  );
}
