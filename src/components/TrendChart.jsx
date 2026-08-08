import React from "react";

export default function TrendChart({ points, width = 560, height = 140, unit = "y", color = "var(--signal)" }) {
  const pad = { top: 14, right: 14, bottom: 24, left: 34 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(...points) * 1.1;
  const min = 0;

  const xy = points.map((v, i) => [
    pad.left + (i / (points.length - 1)) * w,
    pad.top + h - ((v - min) / (max - min)) * h,
  ]);
  const path = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${xy[xy.length - 1][0].toFixed(1)},${pad.top + h} L${xy[0][0].toFixed(1)},${pad.top + h} Z`;
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Remaining useful life trend over recent readings">
      {gridLines.map((g) => (
        <line key={g} x1={pad.left} x2={width - pad.right} y1={pad.top + h * (1 - g)} y2={pad.top + h * (1 - g)} stroke="var(--line)" strokeWidth="1" />
      ))}
      <text x={4} y={pad.top + 4} fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-mute)">{max.toFixed(0)}{unit}</text>
      <text x={4} y={pad.top + h} fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-mute)">0</text>
      <path d={area} fill={color} fillOpacity="0.10" stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {xy.map(([x, y], i) => (i === xy.length - 1 ? <circle key={i} cx={x} cy={y} r="3.2" fill={color} /> : null))}
      <text x={xy[xy.length - 1][0]} y={height - 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="11" fill="var(--ink)">
        now: {points[points.length - 1]}{unit}
      </text>
      <text x={pad.left} y={height - 4} textAnchor="start" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-mute)">
        14 readings back
      </text>
    </svg>
  );
}
