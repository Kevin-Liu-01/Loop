"use client";

import { useRef, useEffect } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import { cn } from "@/lib/cn";
import {
  DIFF_FRAMES,
  FONT_CSS,
  LINE_HEIGHT,
  PANEL,
} from "@/lib/home-landing/constants";
import {
  createAnimState,
  stepAnimState,
  type AnimState,
} from "@/lib/home-landing/diff-state";
import {
  renderDiffPanel,
  computePanelHeight,
} from "@/lib/home-landing/diff-renderer";

function measureCharWidth(): number {
  const probe = prepareWithSegments("M", FONT_CSS);
  const result = layoutWithLines(probe, 9999, LINE_HEIGHT);
  return result.lines[0]?.width ?? 7.8;
}

export function DiffLoopCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<AnimState>(createAnimState());
  const charWidthRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId = 0;
    let lastTime = 0;

    async function init() {
      await document.fonts.ready;

      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      charWidthRef.current = measureCharWidth();

      const maxLines = Math.max(...DIFF_FRAMES.map((f) => f.lines.length));
      const panelH = computePanelHeight(maxLines);
      const dpr = window.devicePixelRatio || 1;

      canvas!.width = PANEL.width * dpr;
      canvas!.height = panelH * dpr;
      canvas!.style.width = `${PANEL.width}px`;
      canvas!.style.height = `${panelH}px`;
      ctx.scale(dpr, dpr);

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) {
        stateRef.current = {
          ...stateRef.current,
          phase: "holding",
          lineIndex: DIFF_FRAMES[0].lines.length,
          fadeProgress: 1,
        };
        renderDiffPanel(
          ctx,
          PANEL.width,
          panelH,
          stateRef.current,
          charWidthRef.current
        );
        return;
      }

      lastTime = performance.now();

      function tick(time: number) {
        const dt = Math.min(time - lastTime, 50);
        lastTime = time;

        stateRef.current = stepAnimState(stateRef.current, dt);
        renderDiffPanel(
          ctx!,
          PANEL.width,
          panelH,
          stateRef.current,
          charWidthRef.current
        );

        animId = requestAnimationFrame(tick);
      }

      animId = requestAnimationFrame(tick);
    }

    init();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className={cn("max-w-full", className)} />;
}
