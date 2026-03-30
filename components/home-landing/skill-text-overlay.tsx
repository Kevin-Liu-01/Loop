"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HERO_SKILL_LINES } from "@/lib/home-landing/hero-skill-lines";

const TARGET_FPS = 24;
const FRAME_INTERVAL = 1 / TARGET_FPS;
const REVEAL_RADIUS = 140;
const REVEAL_FEATHER = 60;

const DIM_ALPHA = 0.06;
const BRIGHTNESS_THRESHOLD = 25;
const BRIGHTNESS_GAIN = 1.8;

const COLOR_ADDED = "rgba(74, 222, 128, 0.82)";
const COLOR_REMOVED = "rgba(248, 113, 113, 0.7)";
const COLOR_CONTEXT = "rgba(235, 232, 228, 0.65)";

function diffColor(kind: string): string {
  if (kind === "added") return COLOR_ADDED;
  if (kind === "removed") return COLOR_REMOVED;
  return COLOR_CONTEXT;
}

function tileLine(text: string, charCount: number): string {
  if (!text || text.trim() === "") return " ".repeat(charCount);
  const sep = "    ";
  let out = "";
  while (out.length < charCount) out += text + sep;
  return out.slice(0, charCount);
}

function prerenderTextCanvas(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  rows: number,
  cellH: number,
  charsPerRow: number,
  font: string,
  colorFn: (kind: string) => string,
  bgFill?: string,
) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  if (bgFill) {
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  ctx.font = font;
  ctx.textBaseline = "top";

  for (let r = 0; r < rows; r++) {
    const lineIdx = r % HERO_SKILL_LINES.length;
    const line = HERO_SKILL_LINES[lineIdx];
    const text = tileLine(line.text, charsPerRow);
    ctx.fillStyle = colorFn(line.kind);
    ctx.fillText(text, 0, r * cellH);
  }
}

export type SkillTextOverlayProps = {
  renderIndex?: number;
  resolution?: number;
  fontFamily?: string;
  bgColor?: string;
  pointerRevealRef?: MutableRefObject<{ x: number; y: number; active: boolean }>;
};

export function SkillTextOverlay({
  renderIndex = 1,
  resolution = 0.12,
  fontFamily = '"IBM Plex Mono", "SFMono-Regular", "SF Mono", monospace',
  bgColor = "#08080a",
  pointerRevealRef,
}: SkillTextOverlayProps) {
  const { size, gl, scene, camera } = useThree();
  const accumulatorRef = useRef(0);

  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const cols = Math.max(1, Math.round(size.width * resolution));
  const rows = Math.max(1, Math.round(size.height * resolution));
  const cellH = size.height / rows;
  const fontSize = Math.max(6, Math.floor(cellH * 0.78));
  const charsPerRow = Math.ceil(size.width / (fontSize * 0.6)) + 10;

  const renderTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(cols, rows, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });
  }, [cols, rows]);

  useEffect(() => () => renderTarget.dispose(), [renderTarget]);

  const pixelBuffer = useMemo(() => new Uint8Array(cols * rows * 4), [cols, rows]);

  useEffect(() => {
    const parent = gl.domElement.parentNode as HTMLElement;
    if (!parent) return;

    const output = document.createElement("canvas");
    output.width = size.width;
    output.height = size.height;
    output.style.position = "absolute";
    output.style.top = "0";
    output.style.left = "0";
    output.style.pointerEvents = "none";
    output.style.zIndex = "1";
    outputRef.current = output;

    if (pointerRevealRef) {
      gl.domElement.style.opacity = "1";
      gl.domElement.style.position = "relative";
      gl.domElement.style.zIndex = "0";
    } else {
      gl.domElement.style.opacity = "0";
    }

    parent.appendChild(output);

    bgCanvasRef.current = document.createElement("canvas");
    fgCanvasRef.current = document.createElement("canvas");
    tempCanvasRef.current = document.createElement("canvas");
    maskCanvasRef.current = document.createElement("canvas");

    return () => {
      parent.removeChild(output);
      outputRef.current = null;
      gl.domElement.style.opacity = "1";
      gl.domElement.style.position = "";
      gl.domElement.style.zIndex = "";
    };
  }, [gl, size.width, size.height, pointerRevealRef]);

  useEffect(() => {
    const bg = bgCanvasRef.current;
    const fg = fgCanvasRef.current;
    const temp = tempCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!bg || !fg || !temp || !mask) return;

    const w = size.width;
    const h = size.height;
    const font = `${fontSize}px ${fontFamily}`;

    prerenderTextCanvas(bg, w, h, rows, cellH, charsPerRow, font, () => `rgba(235, 232, 228, ${DIM_ALPHA})`, bgColor);
    prerenderTextCanvas(fg, w, h, rows, cellH, charsPerRow, font, diffColor);

    temp.width = w;
    temp.height = h;

    mask.width = cols;
    mask.height = rows;
  }, [size.width, size.height, rows, cols, cellH, charsPerRow, fontSize, fontFamily, bgColor]);

  useEffect(() => {
    if (!pointerRevealRef) return;
    const output = outputRef.current;
    if (!output) return;

    const onMove = () => {
      const ptr = pointerRevealRef.current;
      if (ptr.active) {
        const r = REVEAL_RADIUS;
        const f = REVEAL_FEATHER;
        const m = `radial-gradient(circle ${r}px at ${ptr.x}px ${ptr.y}px, transparent ${r - f}px, black ${r}px)`;
        output.style.maskImage = m;
        output.style.webkitMaskImage = m;
      }
    };

    const onLeave = () => {
      output.style.maskImage = "none";
      output.style.webkitMaskImage = "none";
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
  }, [gl, pointerRevealRef]);

  useFrame((_state, delta) => {
    accumulatorRef.current += delta;
    if (accumulatorRef.current < FRAME_INTERVAL) return;
    accumulatorRef.current %= FRAME_INTERVAL;

    const output = outputRef.current;
    const bg = bgCanvasRef.current;
    const fg = fgCanvasRef.current;
    const temp = tempCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!output || !bg || !fg || !temp || !mask) return;

    const w = size.width;
    const h = size.height;

    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);
    gl.setRenderTarget(prevTarget);

    gl.readRenderTargetPixels(renderTarget, 0, 0, cols, rows, pixelBuffer);

    const maskCtx = mask.getContext("2d")!;
    const maskData = maskCtx.createImageData(cols, rows);
    const md = maskData.data;
    const buf = pixelBuffer;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const src = ((rows - 1 - r) * cols + c) * 4;
        const brightness = (buf[src] + buf[src + 1] + buf[src + 2]) / 3;
        const dst = (r * cols + c) * 4;
        md[dst] = 255;
        md[dst + 1] = 255;
        md[dst + 2] = 255;
        const raw = (brightness - BRIGHTNESS_THRESHOLD) * BRIGHTNESS_GAIN;
        md[dst + 3] = raw > 0 ? Math.min(255, raw) : 0;
      }
    }
    maskCtx.putImageData(maskData, 0, 0);

    const tempCtx = temp.getContext("2d")!;
    tempCtx.clearRect(0, 0, w, h);
    tempCtx.globalCompositeOperation = "source-over";
    tempCtx.drawImage(fg, 0, 0);
    tempCtx.globalCompositeOperation = "destination-in";
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.drawImage(mask, 0, 0, cols, rows, 0, 0, w, h);
    tempCtx.globalCompositeOperation = "source-over";

    const outCtx = output.getContext("2d")!;
    outCtx.drawImage(bg, 0, 0);
    outCtx.drawImage(temp, 0, 0);
  }, renderIndex);

  return null;
}
