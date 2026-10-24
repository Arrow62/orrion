import { AnimatePresence, motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import { useEffect, useState } from "react";
import bird from "@/assets/splash-bird.jpg";

export function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem("orrion-splash")) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => {
      sessionStorage.setItem("orrion-splash", "1");
      setShow(false);
    }, 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-background py-[12vh]"
          role="status"
          aria-label="Loading Orrion"
        >
          <img src={bird} alt="" width={768} height={1024}
            className="absolute inset-0 size-full object-cover object-left-bottom opacity-90" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="relative text-center">
            <div className="flex items-center justify-center gap-3">
              <Sparkle className="size-8 fill-primary text-primary" />
              <span className="font-brand text-4xl tracking-[0.2em] text-primary">ORRION</span>
            </div>
            <p className="mt-3 eyebrow text-primary/80">Trending today ✦ Yours tomorrow</p>
          </motion.div>
          <div className="relative flex flex-col items-center gap-4">
            <svg className="size-12 animate-spin" viewBox="0 0 50 50" aria-hidden>
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="2" className="stroke-border" />
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 200" className="stroke-primary" />
            </svg>
            <p className="eyebrow text-center text-primary/80">Loading your next<br />favourite finds…</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
