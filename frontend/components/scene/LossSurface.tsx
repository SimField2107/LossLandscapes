"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGridMinMax } from "@/lib/landscape";
import type { LandscapeData } from "@/lib/landscape";

import vertexShader from "./shaders/surface.vert";
import fragmentShader from "./shaders/surface.frag";

interface LossSurfaceProps {
  landscapeA: LandscapeData | null;
  landscapeB?: LandscapeData | null;
  morphProgress?: number;
  heightScale?: number;
  colorMode?: "jet" | "turbo" | "gradient";
  showGrid?: boolean;
  wireframe?: boolean;
}

function createDataTexture(
  data: number[][] | undefined,
  gridSize: number
): THREE.DataTexture {
  const size = gridSize;
  const textureData = new Float32Array(size * size);

  if (data) {
    const { min, max } = getGridMinMax(data);
    const range = max - min || 1;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const val = data[i]?.[j] ?? 0;
        textureData[i * size + j] = (val - min) / range;
      }
    }
  }

  const texture = new THREE.DataTexture(
    textureData,
    size,
    size,
    THREE.RedFormat,
    THREE.FloatType
  );
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

export default function LossSurface({
  landscapeA,
  landscapeB,
  morphProgress = 0,
  heightScale = 0.8,
  colorMode = "jet",
  showGrid = true,
  wireframe = false,
}: LossSurfaceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const gridSize = landscapeA?.gridSize ?? 51;

  const heightTextureA = useMemo(() => {
    return createDataTexture(landscapeA?.loss, gridSize);
  }, [landscapeA, gridSize]);

  const heightTextureB = useMemo(() => {
    if (landscapeB) {
      return createDataTexture(landscapeB.loss, gridSize);
    }
    return heightTextureA;
  }, [landscapeB, heightTextureA, gridSize]);

  const gradientTextureA = useMemo(() => {
    return createDataTexture(landscapeA?.gradientMagnitude, gridSize);
  }, [landscapeA, gridSize]);

  const uniforms = useMemo(
    () => ({
      uHeightMap: { value: heightTextureA },
      uHeightMapB: { value: heightTextureB },
      uGradientMap: { value: gradientTextureA },
      uHeightScale: { value: heightScale },
      uMorph: { value: 0 },
      uFresnelPower: { value: 3.0 },
      uRimIntensity: { value: 0.25 },
      uRimColor: { value: new THREE.Color("#ffffff") },
      uColorMode: { value: 0 },
      uGridStrength: { value: showGrid ? 0.35 : 0 },
      uWireframeBlend: { value: 0 },
    }),
    [heightTextureA, heightTextureB, gradientTextureA, heightScale, showGrid]
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uHeightMap.value = heightTextureA;
      materialRef.current.uniforms.uHeightMapB.value = heightTextureB;
      materialRef.current.uniforms.uGradientMap.value = gradientTextureA;
    }
  }, [heightTextureA, heightTextureB, gradientTextureA]);

  useEffect(() => {
    if (materialRef.current) {
      let mode = 0;
      if (colorMode === "turbo") mode = 1;
      else if (colorMode === "gradient") mode = 2;
      materialRef.current.uniforms.uColorMode.value = mode;
    }
  }, [colorMode]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uGridStrength.value = showGrid ? 0.35 : 0;
    }
  }, [showGrid]);

  useFrame(() => {
    if (materialRef.current) {
      const currentMorph = materialRef.current.uniforms.uMorph.value;
      const targetMorph = morphProgress;
      materialRef.current.uniforms.uMorph.value +=
        (targetMorph - currentMorph) * 0.1;
    }
  });

  if (!landscapeA) {
    return null;
  }

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[2, 2, gridSize - 1, gridSize - 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
