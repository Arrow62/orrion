import { useEffect, useRef, useState } from "react";
import video from "@/assets/videos/magpie_landing_splash.mp4.asset.json";
import poster from "@/assets/splash-poster.jpg";

/**
 * Homepage-only opening screen: the magpie video plays full screen for 5 seconds.
 * CSS (splash-auto-hide) fades it out even if scripts are slow; JS removes it afterwards.
 */
export function Splash() {
  const [mounted, setMounted] = useState(true);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    ref.current?.play().catch(() => {});
    const t = setTimeout(() => setMounted(false), 5000);
    return () => clearTimeout(t);
  }, []);
  if (!mounted) return null;
  return (
    <div className="splash-auto-hide fixed inset-0 z-[100] overflow-hidden bg-background" role="status" aria-label="Loading Orrion">
      <video ref={ref} src={video.url} poster={poster} autoPlay muted playsInline preload="auto" disablePictureInPicture
        className="absolute inset-0 size-full object-cover [transform:translateZ(0)]" />
    </div>
  );
}
