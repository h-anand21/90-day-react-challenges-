import { motion } from "framer-motion";

export function Waveform({
  active = true,
  bars = 36,
  className = "",
}: {
  active?: boolean;
  bars?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-[3px] sm:gap-[4px] h-12 overflow-hidden ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        // Envelope multipliers creating sinusoidal soundwave humps matching screenshot
        const envelope = 0.3 + 0.7 * Math.abs(Math.sin((i / bars) * Math.PI * 4));
        const baseHeightPercent = Math.max(25, Math.min(95, envelope * 100));

        return (
          <motion.span
            key={i}
            className="w-[3px] sm:w-[3.5px] rounded-full bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 block shrink-0 origin-center shadow-sm"
            style={{ height: `${baseHeightPercent}%` }}
            animate={
              active
                ? {
                    scaleY: [0.35, 1.25, 0.5, 1.4, 0.45, 1.1, 0.35],
                  }
                : { scaleY: 0.35 }
            }
            transition={{
              duration: 1.1 + (i % 6) * 0.12,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: (i % 8) * 0.07,
            }}
          />
        );
      })}
    </div>
  );
}
