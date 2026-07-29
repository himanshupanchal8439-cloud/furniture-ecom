"use client";

import { useId, useState } from "react";
import type { RevenueTrendPoint } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export function RevenueChart({ data }: { data: RevenueTrendPoint[] }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const max = Math.max(1, ...data.map((d) => d.revenue));
  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => {
    const x = PAD_X + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth);
    const y = PAD_TOP + plotHeight - (d.revenue / max) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + plotHeight} L ${points[0].x} ${PAD_TOP + plotHeight} Z`;

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
          let closest = 0;
          let closestDist = Infinity;
          points.forEach((p, i) => {
            const dist = Math.abs(p.x - relX);
            if (dist < closestDist) {
              closestDist = dist;
              closest = i;
            }
          });
          setHoverIndex(closest);
        }}
      >
        <line
          x1={PAD_X}
          y1={PAD_TOP + plotHeight}
          x2={WIDTH - PAD_X}
          y2={PAD_TOP + plotHeight}
          stroke="var(--border-subtle)"
          strokeWidth={1}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-walnut)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-walnut)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--color-walnut)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {hovered && (
          <line
            x1={hovered.x}
            y1={PAD_TOP}
            x2={hovered.x}
            y2={PAD_TOP + plotHeight}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        )}

        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={4}
          fill="var(--color-walnut)"
        />
        {hovered && <circle cx={hovered.x} cy={hovered.y} r={4} fill="var(--color-walnut)" />}

        <text x={PAD_X} y={HEIGHT - 6} fontSize="10" fill="var(--foreground)" opacity={0.5}>
          {formatShortDate(data[0].date)}
        </text>
        <text x={WIDTH - PAD_X} y={HEIGHT - 6} fontSize="10" fill="var(--foreground)" opacity={0.5} textAnchor="end">
          {formatShortDate(data[data.length - 1].date)}
        </text>
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(hovered.x / WIDTH) * 100}%` }}
        >
          <div className="font-medium">{formatPrice(hovered.revenue)}</div>
          <div className="text-foreground/50">{formatShortDate(hovered.date)}</div>
        </div>
      )}
    </div>
  );
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
