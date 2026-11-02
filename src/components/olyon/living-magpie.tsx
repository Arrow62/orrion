import bird from "@/assets/splash-bird.jpg";
import { cn } from "@/lib/utils";

const CREAM = "bg-[rgb(248,245,230)]";

/**
 * Animates the magpie that is painted inside the forest illustration itself.
 * A copy of the same picture, clipped to just the head, turns around the neck;
 * a soft cream patch hides the original head underneath. The wrapper keeps the
 * picture's 3:4 shape so all clip boxes line up with the painting.
 */
export function LivingMagpieScene({ className, eager }: { className?: string; eager?: boolean }) {
  const img = (cls = "") => (
    <img src={bird} alt="" width={768} height={1024} loading={eager ? "eager" : "lazy"} draggable={false}
      className={cn("absolute inset-0 size-full select-none", cls)} />
  );
  return (
    <div className={cn("relative aspect-[3/4] overflow-hidden", className)} aria-hidden>
      <div className="scene-drift absolute inset-0">
        {img()}
        <span className={cn("absolute left-[33.5%] top-[34.6%] h-[6.6%] w-[16%] rounded-[40%] blur-[2px]", CREAM)} />
        <div className="bird-head-live absolute inset-0">
          {img("[clip-path:polygon(33.5%_34.5%,49.5%_34.5%,49.5%_39%,44%_41.8%,34%_41.8%)]")}
        </div>
        <span className={cn("mist-drift pointer-events-none absolute -inset-x-[20%] bottom-[6%] h-[22%] rounded-full opacity-60 blur-2xl", CREAM)} />
      </div>
    </div>
  );
}
