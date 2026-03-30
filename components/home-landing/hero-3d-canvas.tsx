"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { cn } from "@/lib/cn";
import { HERO_CAMERA } from "@/lib/home-landing/hero-3d-constants";

import { Hero3DScene } from "./hero-3d-scene";

function Hero3DFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full min-h-[100dvh] w-full items-center justify-center bg-[#08080a]",
        className
      )}
    >
      <div className="h-24 w-24 animate-pulse rounded-full bg-white/[0.04] ring-1 ring-white/[0.06]" />
    </div>
  );
}

export type Hero3DCanvasProps = {
  className?: string;
  ambient?: boolean;
};

export function Hero3DCanvas({ className, ambient = false }: Hero3DCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const revealRef = useRef({ x: 0, y: 0, active: false });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      pointerRef.current.x = Math.min(1, Math.max(-1, (e.clientX - cx) / Math.max(cx, 1)));
      pointerRef.current.y = Math.min(1, Math.max(-1, (e.clientY - cy) / Math.max(cy, 1)));
    };

    if (ambient) {
      window.addEventListener("pointermove", onMove);
      return () => {
        window.removeEventListener("pointermove", onMove);
      };
    }

    const el = wrapRef.current;
    if (!el) return;

    const localMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      pointerRef.current.x = Math.min(1, Math.max(-1, (e.clientX - cx) / (r.width / 2)));
      pointerRef.current.y = Math.min(1, Math.max(-1, (e.clientY - cy) / (r.height / 2)));
    };

    const onLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    el.addEventListener("pointermove", localMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", localMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ambient]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onEnter = () => { revealRef.current.active = true; };
    const onLeave = () => { revealRef.current.active = false; };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      revealRef.current.x = e.clientX - r.left;
      revealRef.current.y = e.clientY - r.top;
      revealRef.current.active = true;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative isolate overflow-hidden",
        ambient ? "h-full min-h-[100dvh] w-full" : "rounded-[inherit]",
        className
      )}
    >
      <Suspense fallback={<Hero3DFallback />}>
        <Canvas
          camera={{ fov: HERO_CAMERA.fov, position: [...HERO_CAMERA.position] }}
          className={cn(
            "w-full touch-none",
            ambient ? "min-h-[100dvh] !h-[100dvh]" : "!h-[min(52vh,420px)]"
          )}
          dpr={1}
          gl={{
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Hero3DScene
            pointerRef={pointerRef}
            pointerRevealRef={revealRef}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
