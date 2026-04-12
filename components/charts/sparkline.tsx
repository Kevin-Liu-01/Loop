import { smoothPath, scaleLinear, niceMax } from "./chart-utils";
import type { Point } from "./chart-utils";

interface SparklineProps {
  data: number[];
  className?: string;
  color?: string;
  height?: number;
  fill?: boolean;
}

const VB_W = 100;
const VB_H = 32;
const PAD = 2;

export function Sparkline({
  data,
  className,
  color = "var(--color-accent)",
  height = 32,
  fill = true,
}: SparklineProps) {
  if (data.length < 2 || data.every((v) => v === 0)) {
    return null;
  }

  const max = niceMax(Math.max(...data));
  const xScale = scaleLinear([0, data.length - 1], [PAD, VB_W - PAD]);
  const yScale = scaleLinear([0, max], [VB_H - PAD, PAD]);

  const points: Point[] = data.map((v, i) => ({
    x: xScale(i),
    y: yScale(v),
  }));

  const linePath = smoothPath(points);
  const areaPath = fill
    ? `${linePath}L${VB_W - PAD},${VB_H}L${PAD},${VB_H}Z`
    : "";

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", height, width: "100%" }}
      aria-hidden
    >
      {fill && <path d={areaPath} fill={color} opacity={0.1} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
