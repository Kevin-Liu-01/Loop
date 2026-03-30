"use client";

import { Shader, Aurora, LinearGradient, Dither, FilmGrain } from "shaders/react";

export function HeroShader() {
  return (
    <Shader className="pointer-events-none h-full w-full">
      <LinearGradient colorA="#08080a" colorB="#0d0804" angle={180} />
      <Aurora
        colorA="#7a2e00"
        colorB="#e8650a"
        colorC="#ff7a1a"
        intensity={35}
        speed={2}
        waviness={45}
        height={160}
        center={{ x: 0.5, y: 0.3 }}
      />
      <Dither
        pattern="bayer8"
        pixelSize={3}
        threshold={0.5}
        spread={0.8}
        colorMode="source"
        opacity={0.12}
        blendMode="screen"
      />
      <FilmGrain strength={0.3} />
    </Shader>
  );
}
