"use client";

import { motion, useReducedMotion } from "motion/react";

export function BrandWordmark({ hover }: { hover: boolean }) {
  const reduced = useReducedMotion();

  return (
    <span className="inline-flex items-baseline overflow-hidden">
      <span className="sr-only">Loop</span>
      <span aria-hidden="true">L</span>
      <span aria-hidden="true">o</span>
      <motion.span
        className="inline-flex overflow-hidden"
        initial={false}
        animate={{ width: hover ? "auto" : 0 }}
        transition={
          reduced
            ? { duration: 0.15 }
            : { type: "spring", stiffness: 400, damping: 26, mass: 0.8 }
        }
        aria-hidden="true"
      >
        {[..."oo"].map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block text-accent"
            initial={false}
            animate={{
              opacity: hover ? 1 : 0,
              rotate: hover ? 0 : -90,
              scale: hover ? 1 : 0.3,
            }}
            transition={
              reduced
                ? { duration: 0.15 }
                : {
                    type: "spring",
                    stiffness: 380,
                    damping: 22,
                    delay: hover ? i * 0.04 : (1 - i) * 0.02,
                  }
            }
          >
            {ch}
          </motion.span>
        ))}
      </motion.span>
      <span aria-hidden="true">op</span>
    </span>
  );
}
