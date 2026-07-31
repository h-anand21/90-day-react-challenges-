import React from "react";

export interface GaugeProps {
  value: number; // 0 - 100
  color?: string;
  showLabels?: boolean;
  min?: string;
  max?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  color = "#ef4d23",
  showLabels = false,
  min,
  max,
}) => {
  const totalTicks = 40;
  const activeCount = Math.round((Math.min(100, Math.max(0, value)) / 100) * totalTicks);

  const ticks = Array.from({ length: totalTicks }).map((_, i) => {
    // 180 degree arc starting at Math.PI (180 deg) sweeping to Math.PI * 2 (360 deg)
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const rInner = 70;
    const rOuter = 80;

    const x1 = 100 + rInner * Math.cos(angle);
    const y1 = 100 + rInner * Math.sin(angle);
    const x2 = 100 + rOuter * Math.cos(angle);
    const y2 = 100 + rOuter * Math.sin(angle);

    const isActive = i < activeCount;

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? color : "#d4d4d8"}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-colors duration-300"
      />
    );
  });

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox="0 0 200 120"
        className="w-full max-w-[260px] h-auto overflow-visible"
        aria-label={`Gauge representing ${value}%`}
      >
        <g>{ticks}</g>
        <text
          x="100"
          y="102"
          textAnchor="middle"
          fontSize="22"
          fontWeight="600"
          fill="#0b0f1a"
          className="font-sans select-none"
        >
          {value}%
        </text>
      </svg>

      {showLabels && (min || max) && (
        <div className="w-full max-w-[260px] flex justify-between items-center text-[11px] text-neutral-500 font-medium mt-1 px-2">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};
