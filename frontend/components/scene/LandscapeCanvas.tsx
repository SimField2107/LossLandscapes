"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
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
    <EffectComposer multisampling={8}>
      <Bloom
        intensity={0.15}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette darkness={0.3} offset={0.4} />
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
          position: [2.8, 1.8, 2.8],
          fov: 40,
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

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={0.9}
            castShadow={false}
          />
          <directionalLight
            position={[-5, 3, -5]}
            intensity={0.3}
            color="#ffffff"
          />
          <directionalLight
            position={[0, -2, 5]}
            intensity={0.15}
            color="#ffffff"
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
