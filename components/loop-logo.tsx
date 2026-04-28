"use client";

import { motion, useReducedMotion } from "motion/react";
import type { SVGProps } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import {
  LOOP_GEAR_BODY_PATH,
  LOOP_GEAR_CHIP_PATH,
} from "@/lib/loop-logo-paths";

type LoopLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
  /** When set (e.g. brand link hover), expands hit target beyond the SVG. */
  interactionActive?: boolean;
  /** Override chip fill class. Defaults to black in light / white in dark. */
  chipClassName?: string;
  /** Persistent accent glow for Operator subscribers. */
  operatorGlow?: boolean;
};

const ORIGIN = "64px 60px";

/** Rest: chip offset in viewBox units. Hover: 0,0 (seated in rim). */
const CHIP_FLOAT = { x: -12, y: 2.87 };

function ChipPath({ className }: { className?: string }) {
  return <path d={LOOP_GEAR_CHIP_PATH} className={className} />;
}

/**
 * Golden-ratio gear-loop mark with a detachable white chip.
 * Rest: chip floating. Hover: chip seats + gear spins (reduced motion: seat, no spin).
 *
 * Chip uses Motion x/y on SVG (user units). `reducedMotion` does not force the chip seated
 * at rest – that made the piece look “locked” until hover for prefers-reduced-motion users.
 */
export function LoopLogo({
  title = "Loop",
  className,
  interactionActive,
  chipClassName,
  operatorGlow,
  ...props
}: LoopLogoProps) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const controlled = interactionActive !== undefined;
  const engaged = controlled ? interactionActive : hovered;

  const spin = mounted && engaged && !reducedMotion;
  const chipSeated = engaged;

  const chipPathClass = chipClassName ?? "fill-ink";

  return (
    <svg
      viewBox="0 0 134 120"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "touch-manipulation",
        operatorGlow &&
          "drop-shadow-[0_0_6px_rgba(232,101,10,0.45)] dark:drop-shadow-[0_0_8px_rgba(232,101,10,0.5)]",
        className
      )}
      onPointerEnter={controlled ? undefined : () => setHovered(true)}
      onPointerLeave={controlled ? undefined : () => setHovered(false)}
      {...props}
    >
      <title>{title}</title>
      {!mounted ? (
        <g style={{ transformOrigin: ORIGIN }}>
          <path d={LOOP_GEAR_BODY_PATH} fill="currentColor" />
          <circle cx="64" cy="60" r="7" fill="currentColor" />
          <g
            style={{ transformOrigin: ORIGIN }}
            transform={`translate(${CHIP_FLOAT.x},${CHIP_FLOAT.y})`}
          >
            <ChipPath className={chipPathClass} />
          </g>
        </g>
      ) : (
        <motion.g
          style={{ transformOrigin: ORIGIN }}
          animate={{ rotate: spin ? 360 : 0 }}
          transition={
            spin
              ? { rotate: { duration: 1.8, ease: "linear", repeat: Infinity } }
              : { rotate: { duration: 0.35, ease: "easeOut" } }
          }
        >
          <path d={LOOP_GEAR_BODY_PATH} fill="currentColor" />
          <circle cx="64" cy="60" r="7" fill="currentColor" />
          <motion.g
            style={{ transformOrigin: ORIGIN }}
            initial={false}
            animate={{
              x: chipSeated ? 0 : CHIP_FLOAT.x,
              y: chipSeated ? 0 : CHIP_FLOAT.y,
            }}
            transition={{ damping: 28, stiffness: 420, type: "spring" }}
          >
            <ChipPath className={chipPathClass} />
          </motion.g>
        </motion.g>
      )}
    </svg>
  );
}
