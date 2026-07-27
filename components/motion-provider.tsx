"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

interface MotionRuntimeProps extends MotionProviderProps {
  prefersReducedMotion: boolean;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.matchMedia(REDUCED_MOTION_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  return prefersReducedMotion;
}

function MotionRuntime({ children, prefersReducedMotion }: MotionRuntimeProps) {
  const pathname = usePathname();
  const pageRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!(lenis && !prefersReducedMotion)) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const updateLenis = (time: number) => lenis.raf(time * 1000);
    const updateScrollTrigger = () => ScrollTrigger.update();

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateLenis);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis, prefersReducedMotion]);

  useEffect(() => {
    if (lenis && !prefersReducedMotion) {
      const target = window.location.hash || 0;
      lenis.scrollTo(target, { immediate: true });
    }
  }, [lenis, pathname, prefersReducedMotion]);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion) {
      gsap.set(page, { clearProps: "all" });
      gsap.set(page.querySelectorAll("[data-motion]"), { clearProps: "all" });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        page,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          clearProps: "opacity,transform,visibility",
          duration: 0.45,
          ease: "power3.out",
          y: 0,
        }
      );

      gsap.fromTo(
        "[data-motion='hero'] > *",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          clearProps: "opacity,transform,visibility",
          delay: 0.08,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          y: 0,
        }
      );

      gsap.fromTo(
        "[data-motion='hero-card']",
        { autoAlpha: 0, scale: 0.97, y: 36 },
        {
          autoAlpha: 1,
          clearProps: "opacity,transform,visibility",
          delay: 0.28,
          duration: 1,
          ease: "power3.out",
          scale: 1,
          y: 0,
        }
      );

      for (const section of gsap.utils.toArray<HTMLElement>(
        "[data-motion='section']"
      )) {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 42 },
          {
            autoAlpha: 1,
            clearProps: "opacity,transform,visibility",
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              once: true,
              start: "top 86%",
              trigger: section,
            },
            y: 0,
          }
        );
      }

      const heroCard = page.querySelector<HTMLElement>(
        "[data-motion='hero-card']"
      );
      if (heroCard) {
        gsap.to(heroCard, {
          ease: "none",
          scrollTrigger: {
            end: "bottom top",
            scrub: 0.65,
            start: "top 70%",
            trigger: heroCard,
          },
          yPercent: -7,
        });
      }
    }, page);

    const refreshFrame = window.requestAnimationFrame(() =>
      ScrollTrigger.refresh()
    );

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [pathname, prefersReducedMotion]);

  return (
    <div data-page-transition ref={pageRef}>
      {children}
    </div>
  );
}

export function MotionProvider({ children }: MotionProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <ReactLenis
      options={{
        allowNestedScroll: true,
        anchors: true,
        autoRaf: false,
        lerp: 0.09,
        smoothWheel: !prefersReducedMotion,
        stopInertiaOnNavigate: true,
        syncTouch: false,
      }}
      root
    >
      <MotionRuntime prefersReducedMotion={prefersReducedMotion}>
        {children}
      </MotionRuntime>
    </ReactLenis>
  );
}
