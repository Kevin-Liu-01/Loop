"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { AsciiEffect } from "three-stdlib";

const REVEAL_RADIUS = 140;
const REVEAL_FEATHER = 60;
const TARGET_FPS = 24;
const FRAME_INTERVAL = 1 / TARGET_FPS;

export type SerifAsciiRendererProps = {
  renderIndex?: number;
  bgColor?: string;
  fgColor?: string;
  characters?: string;
  invert?: boolean;
  color?: boolean;
  resolution?: number;
  fontFamily?: string;
  pointerRevealRef?: MutableRefObject<{ x: number; y: number; active: boolean }>;
};

/**
 * Custom AsciiRenderer:
 * - Patches font-family via injected <style> (no MutationObserver).
 * - Throttled to ~24fps — ASCII doesn't need 60fps to look good.
 * - Keeps the WebGL canvas visible underneath with CSS mask for reveal.
 */
export function SerifAsciiRenderer({
  renderIndex = 1,
  bgColor = "black",
  fgColor = "white",
  characters = " .:-+*=%@#",
  invert = true,
  color = false,
  resolution = 0.12,
  fontFamily,
  pointerRevealRef,
}: SerifAsciiRendererProps) {
  const { size, gl, scene, camera } = useThree();
  const accumulatorRef = useRef(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const effect = useMemo(() => {
    const fx = new AsciiEffect(gl, characters, { invert, color, resolution });
    fx.domElement.style.position = "absolute";
    fx.domElement.style.top = "0px";
    fx.domElement.style.left = "0px";
    fx.domElement.style.pointerEvents = "none";
    return fx;
  }, [gl, characters, invert, color, resolution]);

  useLayoutEffect(() => {
    effect.domElement.style.color = fgColor;
    effect.domElement.style.backgroundColor = bgColor;
  }, [effect, fgColor, bgColor]);

  useLayoutEffect(() => {
    if (!fontFamily) return;

    const style = document.createElement("style");
    style.textContent = `
      .ascii-serif-overlay,
      .ascii-serif-overlay table,
      .ascii-serif-overlay td {
        font-family: ${fontFamily} !important;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    effect.domElement.classList.add("ascii-serif-overlay");

    return () => {
      effect.domElement.classList.remove("ascii-serif-overlay");
      style.remove();
      styleRef.current = null;
    };
  }, [effect, fontFamily]);

  useEffect(() => {
    const parent = gl.domElement.parentNode as HTMLElement;

    if (pointerRevealRef) {
      gl.domElement.style.opacity = "1";
      gl.domElement.style.position = "relative";
      gl.domElement.style.zIndex = "0";
      effect.domElement.style.zIndex = "1";
    } else {
      gl.domElement.style.opacity = "0";
    }

    parent.appendChild(effect.domElement);

    return () => {
      gl.domElement.style.opacity = "1";
      gl.domElement.style.position = "";
      gl.domElement.style.zIndex = "";
      parent.removeChild(effect.domElement);
    };
  }, [effect, gl, pointerRevealRef]);

  useEffect(() => {
    if (!pointerRevealRef) return;

    const el = effect.domElement;

    const onMove = () => {
      const ptr = pointerRevealRef.current;
      if (ptr.active) {
        const r = REVEAL_RADIUS;
        const f = REVEAL_FEATHER;
        const mask = `radial-gradient(circle ${r}px at ${ptr.x}px ${ptr.y}px, transparent ${r - f}px, black ${r}px)`;
        el.style.maskImage = mask;
        el.style.webkitMaskImage = mask;
      }
    };

    const onLeave = () => {
      el.style.maskImage = "none";
      el.style.webkitMaskImage = "none";
    };

    const wrap = gl.domElement.parentNode as HTMLElement | null;
    const root = wrap?.parentNode as HTMLElement | null;
    if (!root) return;

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [effect, gl, pointerRevealRef]);

  useEffect(() => {
    const cellW = Math.max(1, Math.round(size.width * resolution));
    const cellH = Math.max(1, Math.round(size.height * resolution));
    const stableW = Math.round(cellW / resolution);
    const stableH = Math.round(cellH / resolution);
    effect.setSize(stableW, stableH);
  }, [effect, size, resolution]);

  useFrame((_state, delta) => {
    accumulatorRef.current += delta;
    if (accumulatorRef.current < FRAME_INTERVAL) return;
    accumulatorRef.current = accumulatorRef.current % FRAME_INTERVAL;
    effect.render(scene, camera);
  }, renderIndex);

  return null;
}
