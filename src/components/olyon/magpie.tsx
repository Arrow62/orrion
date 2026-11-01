import magpie from "@/assets/magpie.png";
import { cn } from "@/lib/utils";

/**
 * Magpie built from one transparent PNG split into two layers:
 * the body (head region clipped away) and the head (only head region),
 * which pivots around the neck with quick, bird-like jerks.
 */
export function AnimatedMagpie({ className, eager }: { className?: string; eager?: boolean }) {
  return (
    <div className={cn("magpie-bob relative aspect-square", className)} aria-hidden>
      <img src={magpie} alt="" width={1024} height={1024} loading={eager ? "eager" : "lazy"}
        className="absolute inset-0 size-full object-contain [clip-path:polygon(0_0,57%_0,57%_27%,100%_27%,100%_100%,0_100%)]" />
      <img src={magpie} alt="" width={1024} height={1024} loading={eager ? "eager" : "lazy"}
        className="magpie-head absolute inset-0 size-full object-contain [clip-path:inset(8%_5%_67%_58%)]" />
    </div>
  );
}
