"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Bounds, Center, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { SkillTextOverlay } from "@/components/home-landing/skill-text-overlay";
import {
  HERO_OVERLAY,
  HERO_BOUNDS_MARGIN,
  HERO_MODEL_PATH,
  HERO_SPOT_COLOR,
} from "@/lib/home-landing/hero-3d-constants";

useGLTF.preload(HERO_MODEL_PATH);

type HeroSceneProps = {
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  pointerRevealRef: MutableRefObject<{ x: number; y: number; active: boolean }>;
  reducedMotion: boolean;
};

function HelmetSubject({
  pointerRef,
  reducedMotion,
}: {
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(HERO_MODEL_PATH);
  const model = useMemo(() => scene.clone(true), [scene]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const px = pointerRef.current.x;
    const py = pointerRef.current.y;
    const t = state.clock.elapsedTime;

    const targetYaw = reducedMotion ? 0 : px * 0.42 + Math.sin(t * 0.32) * 0.06;
    const targetPitch = reducedMotion ? 0 : -py * 0.24 + Math.cos(t * 0.26) * 0.04;
    const targetRoll = reducedMotion ? 0 : px * -0.05;

    const smooth = reducedMotion ? 0.2 : 0.14;
    const k = 1 - Math.exp(-smooth * 60 * delta);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetYaw, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetPitch, k);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetRoll, k * 0.85);
  });

  return (
    <Bounds fit margin={HERO_BOUNDS_MARGIN} maxDuration={0.35} clip={false}>
      <group ref={group}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </Bounds>
  );
}

export function Hero3DScene({ pointerRef, pointerRevealRef, reducedMotion }: HeroSceneProps) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <spotLight
        angle={0.48}
        color={HERO_SPOT_COLOR}
        decay={2}
        intensity={2.8}
        penumbra={0.55}
        position={[4.5, 5.5, 3.5]}
      />
      <directionalLight color="#a8c4ff" intensity={0.7} position={[-4, 2.5, 4]} />

      <HelmetSubject pointerRef={pointerRef} reducedMotion={reducedMotion} />

      <Environment preset="city" background={false} />

      {!reducedMotion ? (
        <SkillTextOverlay
          bgColor={HERO_OVERLAY.bgColor}
          pointerRevealRef={pointerRevealRef}
          resolution={HERO_OVERLAY.resolution}
          renderIndex={1}
        />
      ) : null}
    </>
  );
}
