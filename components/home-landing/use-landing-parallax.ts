"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Subtle scroll-linked depth on elements marked with `data-parallax` (numeric depth, e.g. `-0.2` to `0.6`).
 */
export function useLandingParallax(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-parallax]")
      ) as HTMLElement[];

      for (const el of layers) {
        const raw = el.dataset.parallax;
        const depth = raw === undefined ? 0 : Number.parseFloat(raw);
        if (Number.isNaN(depth)) continue;

        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: depth * 140,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}
