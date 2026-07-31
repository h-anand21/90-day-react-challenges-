export function Waveform({ active = true, bars = 40, className = "" }: { active?: boolean; bars?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-[3px] h-16 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full ${active ? "wave-bar gradient-primary" : "bg-muted"}`}
          style={{
            height: `${(20 + (Math.sin(i * 0.6) + 1) * 25).toFixed(2)}%`,
            animationDelay: `${((i % 10) * 0.08).toFixed(2)}s`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}
