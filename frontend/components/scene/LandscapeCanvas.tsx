"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, type ReactNode } from "react";
import styles from "./LandscapeCanvas.module.scss";

interface LandscapeCanvasProps {
  children: ReactNode;
  className?: string;
  enablePostProcessing?: boolean;
  devMode?: boolean;
}

function PostProcessingStack() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0005, 0.0005]}
      />
      <Vignette darkness={0.4} offset={0.3} />
    </EffectComposer>
  );
}

export default function LandscapeCanvas({
  children,
  className,
  enablePostProcessing = true,
  devMode = false,
}: LandscapeCanvasProps) {
  return (
    <div className={`${styles.canvasContainer} ${className ?? ""}`}>
      <Canvas
        camera={{
          position: [2.5, 2, 2.5],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#0d1117"]} />

          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow={false}
          />
          <directionalLight
            position={[-3, 3, -3]}
            intensity={0.3}
            color="#818cf8"
          />

          {children}

          {enablePostProcessing && <PostProcessingStack />}

          <Preload all />
        </Suspense>
      </Canvas>

      {devMode && (
        <div className={styles.devOverlay}>
          <span>DEV MODE</span>
        </div>
      )}
    </div>
  );
}
