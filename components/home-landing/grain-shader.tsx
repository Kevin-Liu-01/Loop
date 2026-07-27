"use client";

import { useEffect, useRef } from "react";

const VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uLight;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float grain(vec2 uv, float t) {
    return hash(uv * uResolution + t * 1000.0) * 0.12;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.15;

    vec3 darkBase = vec3(0.031, 0.031, 0.039);
    vec3 lightBase = vec3(0.96, 0.96, 0.96);
    vec3 base = mix(darkBase, lightBase, uLight);

    float glow = smoothstep(0.85, 0.0, length((uv - vec2(0.5, 0.28)) * vec2(1.1, 1.4)));
    float darkGlowStr = 0.09;
    float lightGlowStr = 0.38;
    vec3 accent = vec3(0.91, 0.396, 0.039) * glow * mix(darkGlowStr, lightGlowStr, uLight);

    float drift = sin(uv.x * 3.0 + t * 0.8) * 0.003
                + cos(uv.y * 2.5 - t * 0.6) * 0.003;
    accent *= 1.0 + drift * 8.0;

    float grainAmt = grain(uv, uTime) * mix(1.0, 0.45, uLight);
    vec3 color = base + accent + vec3(grainAmt);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface GrainShaderProps {
  className?: string;
}

function getThemeLight(): number {
  return document.documentElement.dataset.theme === "light" ? 1 : 0;
}

export function GrainShader({ className }: GrainShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const target = container;

    let disposed = false;
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let stopRenderer: (() => void) | undefined;

    async function startRenderer() {
      const { Mesh, Program, Renderer, Triangle } = await import("ogl");
      if (disposed) {
        return;
      }

      const isMobile = window.innerWidth < 768;
      const dpr = isMobile
        ? Math.min(window.devicePixelRatio, 1)
        : Math.min(window.devicePixelRatio, 1.5);
      const light = getThemeLight();
      const renderer = new Renderer({ alpha: false, dpr });
      const { gl } = renderer;
      gl.clearColor(
        light === 1 ? 0.96 : 0.031,
        light === 1 ? 0.96 : 0.031,
        light === 1 ? 0.96 : 0.039,
        1
      );
      target.append(gl.canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        fragment: FRAGMENT,
        uniforms: {
          uLight: { value: light },
          uResolution: { value: [gl.canvas.width, gl.canvas.height] },
          uTime: { value: 0 },
        },
        vertex: VERTEX,
      });
      const mesh = new Mesh(gl, { geometry, program });

      function render() {
        const width = target.clientWidth;
        const height = target.clientHeight;
        renderer.setSize(width, height);
        program.uniforms.uResolution.value = [width * dpr, height * dpr];
        renderer.render({ scene: mesh });
      }

      render();
      window.addEventListener("resize", render, { passive: true });

      const observer = new MutationObserver(() => {
        const value = getThemeLight();
        program.uniforms.uLight.value = value;
        gl.clearColor(
          value === 1 ? 0.96 : 0.031,
          value === 1 ? 0.96 : 0.031,
          value === 1 ? 0.96 : 0.039,
          1
        );
        renderer.render({ scene: mesh });
      });
      observer.observe(document.documentElement, {
        attributeFilter: ["data-theme"],
        attributes: true,
      });

      stopRenderer = () => {
        observer.disconnect();
        window.removeEventListener("resize", render);
        if (target.contains(gl.canvas)) {
          gl.canvas.remove();
        }
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => void startRenderer(), {
        timeout: 1200,
      });
    } else {
      timerId = setTimeout(() => void startRenderer(), 250);
    }

    return () => {
      disposed = true;
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      stopRenderer?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ inset: 0, position: "absolute", zIndex: 0 }}
      aria-hidden
    />
  );
}
