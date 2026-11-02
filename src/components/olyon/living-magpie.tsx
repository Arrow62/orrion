import bird from "@/assets/splash-bird.jpg";
import { cn } from "@/lib/utils";

/**
 * Animates the magpie that is painted inside the forest illustration itself.
 * The same picture is layered: a copy clipped to just the head turns around the
 * neck, a cream patch hides the original head, and the branch layer sways.
 * The wrapper keeps the picture's 3:4 shape so all clip boxes line up.
 */
export function LivingMagpieScene({ className, eager }: { className?: string; eager?: boolean }) {
  const img = (cls: string) => (
    <img src={bird} alt="" width={768} height={1024} loading={eager ? "eager" : "lazy"} draggable={false}
      className={cn("absolute inset-0 size-full select-none", cls)} />
  );
  return (
    <div className={cn("relative aspect-[3/4] overflow-hidden", className)} aria-hidden>
      {img("scene-drift")}
      {/* breathing body (bird + branch area) */}
      <div className="bird-body absolute inset-0">
        {img("[clip-path:polygon(0_36%,46%_36%,46%_41%,66%_55%,66%_95%,0_95%)]")}
      </div>
      {/* hide original head */}
      <span className="absolute left-[33%] top-[34%] h-[7.6%] w-[17%] rounded-full bg-[rgb(248,245,230)] blur-[3px]" />
      {/* moving head */}
      <div className="bird-head-live absolute inset-0">
        {img("[clip-path:polygon(33.5%_34.5%,49.5%_34.5%,49.5%_39%,44%_41.6%,34%_41.6%)]")}
      </div>
      <span className="mist-drift pointer-events-none absolute inset-x-[-20%] bottom-[8%] h-[30%] bg-gradient-to-t from-[rgb(248,245,230)]/0 via-[rgb(248,245,230)]/60 to-[rgb(248,245,230)]/0 blur-xl" />
    </div>
  );
}
