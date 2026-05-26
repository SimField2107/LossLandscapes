"use client";

import { useRef, useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { TrajectoryPoint, LandscapeData } from "@/lib/landscape";

interface TrajectoryLineProps {
  trajectory: TrajectoryPoint[];
  landscape: LandscapeData | null;
  heightScale?: number;
  progress?: number;
  color?: string;
  lineWidth?: number;
}

export default function TrajectoryLine({
  trajectory,
  landscape,
  heightScale = 0.8,
  progress = 1,
  color = "#f59e0b",
  lineWidth = 3,
}: TrajectoryLineProps) {
  const lineRef = useRef<React.ElementRef<typeof Line>>(null);

  const fullPoints = useMemo(() => {
    if (!trajectory || trajectory.length === 0 || !landscape) {
      return [];
    }

    const [alphaMin, alphaMax] = landscape.alphaRange;
    const [betaMin, betaMax] = landscape.betaRange;

    let lossMin = Infinity;
    let lossMax = -Infinity;
    for (const row of landscape.loss) {
      for (const val of row) {
        if (val < lossMin) lossMin = val;
        if (val > lossMax) lossMax = val;
      }
    }
    const lossRange = lossMax - lossMin || 1;

    const fullPts: THREE.Vector3[] = trajectory.map((point) => {
      const x = ((point.alpha - alphaMin) / (alphaMax - alphaMin)) * 2 - 1;
      const z = ((point.beta - betaMin) / (betaMax - betaMin)) * 2 - 1;

      const normalizedLoss = (point.loss - lossMin) / lossRange;
      const y = normalizedLoss * heightScale + 0.02;

      return new THREE.Vector3(x, y, z);
    });

    return fullPts;
  }, [trajectory, landscape, heightScale]);

  const visiblePoints = useMemo(() => {
    if (fullPoints.length === 0) return [];
    const count = Math.max(2, Math.floor(fullPoints.length * progress));
    return fullPoints.slice(0, count);
  }, [fullPoints, progress]);

  if (visiblePoints.length < 2) {
    return null;
  }

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Line
        ref={lineRef}
        points={visiblePoints}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={0.9}
      />

      <mesh position={visiblePoints[visiblePoints.length - 1]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={visiblePoints[0]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
