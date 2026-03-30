import { cn } from "@/lib/cn";
import { smoothPath, scaleLinear, niceMax, type Point } from "./chart-utils";

export type AreaChartDatum = {
  label: string;
  value: number;
  secondary?: number;
};

type AreaChartProps = {
  id: string;
  data: AreaChartDatum[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
};

const VB_W = 600;
const VB_H = 180;
const PAD = { top: 12, right: 12, bottom: 28, left: 40 };

export function AreaChart({
  id,
  data,
  height = 180,
  color = "var(--color-accent)",
  secondaryColor = "var(--color-ink-faint)",
  className,
}: AreaChartProps) {
  if (data.length === 0) return null;

  const allZero = data.every((d) => d.value === 0 && (d.secondary ?? 0) === 0);
  if (allZero) {
    return (
      <div
        className={cn(
          "grid place-items-center text-sm text-ink-faint",
          className
        )}
        style={{ minHeight: height * 0.6 }}
      >
        No events in the last 24 hours
      </div>
    );
  }

  const chartW = VB_W - PAD.left - PAD.right;
  const chartH = VB_H - PAD.top - PAD.bottom;
  const allValues = [
    ...data.map((d) => d.value),
    ...data.map((d) => d.secondary ?? 0),
  ];
  const maxVal = niceMax(Math.max(...allValues));

  const xScale = scaleLinear(
    [0, Math.max(1, data.length - 1)],
    [PAD.left, PAD.left + chartW]
  );
  const yScale = scaleLinear([0, maxVal], [PAD.top + chartH, PAD.top]);

  const primaryPoints: Point[] = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(d.value),
  }));
  const primaryPath = smoothPath(primaryPoints);
  const areaPath = `${primaryPath}L${PAD.left + chartW},${PAD.top + chartH}L${PAD.left},${PAD.top + chartH}Z`;

  const hasSecondary = data.some((d) => (d.secondary ?? 0) > 0);
  const secondaryPath = hasSecondary
    ? smoothPath(
        data.map((d, i) => ({ x: xScale(i), y: yScale(d.secondary ?? 0) }))
      )
    : null;

  const yMid = Math.round(maxVal / 2);
  const yTicks = [0, yMid, maxVal];
  const labelStep = Math.max(1, Math.ceil(data.length / 8));
  const gradId = `${id}-grad`;

  return (
    <div
      className={cn("w-full", className)}
      style={{ aspectRatio: `${VB_W} / ${VB_H}`, maxHeight: height }}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <line
            key={tick}
            x1={PAD.left}
            y1={yScale(tick)}
            x2={PAD.left + chartW}
            y2={yScale(tick)}
            stroke="var(--color-line)"
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} />

        {secondaryPath && (
          <path
            d={secondaryPath}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.5}
          />
        )}

        <path
          d={primaryPath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {primaryPoints.map((p, i) =>
          data[i].value > 0 ? (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
          ) : null
        )}

        {yTicks.map((tick) => (
          <text
            key={tick}
            x={PAD.left - 6}
            y={yScale(tick) + 3.5}
            textAnchor="end"
            fontSize={10}
            fill="var(--color-ink-faint)"
            fontFamily="var(--font-mono)"
          >
            {tick}
          </text>
        ))}

        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <text
              key={i}
              x={xScale(i)}
              y={PAD.top + chartH + 18}
              textAnchor="middle"
              fontSize={9}
              fill="var(--color-ink-faint)"
              fontFamily="var(--font-mono)"
            >
              {d.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
