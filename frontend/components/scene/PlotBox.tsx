"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Line, Text } from "@react-three/drei";

interface PlotBoxProps {
  size?: number;
  height?: number;
  gridDivisions?: number;
  showFloor?: boolean;
  showBackWalls?: boolean;
  showAxes?: boolean;
  showLabels?: boolean;
  alphaRange?: [number, number];
  betaRange?: [number, number];
  lossRange?: [number, number];
  color?: string;
  labelColor?: string;
}

export default function PlotBox({
  size = 2,
  height = 1,
  gridDivisions = 10,
  showFloor = true,
  showBackWalls = true,
  showAxes = true,
  showLabels = true,
  alphaRange = [-1, 1],
  betaRange = [-1, 1],
  lossRange = [0, 1],
  color = "#3a3f4b",
  labelColor = "#8b949e",
}: PlotBoxProps) {
  const half = size / 2;

  const gridLines = useMemo(() => {
    const lines: { points: THREE.Vector3[]; opacity: number }[] = [];
    const step = size / gridDivisions;

    if (showFloor) {
      for (let i = 0; i <= gridDivisions; i++) {
        const offset = -half + i * step;
        const isMain = i === 0 || i === gridDivisions || i === gridDivisions / 2;
        lines.push({
          points: [
            new THREE.Vector3(offset, 0, -half),
            new THREE.Vector3(offset, 0, half),
          ],
          opacity: isMain ? 0.6 : 0.25,
        });
        lines.push({
          points: [
            new THREE.Vector3(-half, 0, offset),
            new THREE.Vector3(half, 0, offset),
          ],
          opacity: isMain ? 0.6 : 0.25,
        });
      }
    }

    if (showBackWalls) {
      for (let i = 0; i <= gridDivisions / 2; i++) {
        const y = (i / (gridDivisions / 2)) * height;
        const isMain = i === 0 || i === gridDivisions / 2;
        lines.push({
          points: [
            new THREE.Vector3(-half, y, -half),
            new THREE.Vector3(half, y, -half),
          ],
          opacity: isMain ? 0.5 : 0.2,
        });
        lines.push({
          points: [
            new THREE.Vector3(-half, y, -half),
            new THREE.Vector3(-half, y, half),
          ],
          opacity: isMain ? 0.5 : 0.2,
        });
      }

      for (let i = 0; i <= gridDivisions; i++) {
        const offset = -half + i * step;
        const isMain = i === 0 || i === gridDivisions || i === gridDivisions / 2;
        lines.push({
          points: [
            new THREE.Vector3(offset, 0, -half),
            new THREE.Vector3(offset, height, -half),
          ],
          opacity: isMain ? 0.4 : 0.15,
        });
        lines.push({
          points: [
            new THREE.Vector3(-half, 0, offset),
            new THREE.Vector3(-half, height, offset),
          ],
          opacity: isMain ? 0.4 : 0.15,
        });
      }
    }

    return lines;
  }, [gridDivisions, half, size, height, showFloor, showBackWalls]);

  const tickLabels = useMemo(() => {
    if (!showLabels) return [];

    const labels: {
      text: string;
      position: [number, number, number];
      rotation?: [number, number, number];
    }[] = [];

    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const t = i / ticks;
      const alpha = alphaRange[0] + (alphaRange[1] - alphaRange[0]) * t;
      const beta = betaRange[0] + (betaRange[1] - betaRange[0]) * t;
      const x = -half + size * t;
      const z = -half + size * t;

      labels.push({
        text: alpha.toFixed(1),
        position: [x, -0.04, half + 0.15],
      });

      labels.push({
        text: beta.toFixed(1),
        position: [-half - 0.15, -0.04, z],
      });
    }

    const heightTicks = 3;
    for (let i = 0; i <= heightTicks; i++) {
      const t = i / heightTicks;
      const loss = lossRange[0] + (lossRange[1] - lossRange[0]) * t;
      const y = height * t;

      labels.push({
        text: loss.toFixed(2),
        position: [-half - 0.2, y, -half],
      });
    }

    return labels;
  }, [alphaRange, betaRange, lossRange, half, size, height, showLabels]);

  return (
    <group>
      {gridLines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          color={color}
          lineWidth={1}
          transparent
          opacity={line.opacity}
        />
      ))}

      {showAxes && (
        <>
          <Line
            points={[
              new THREE.Vector3(-half, 0.001, half),
              new THREE.Vector3(half, 0.001, half),
            ]}
            color="#f85149"
            lineWidth={2}
          />
          <Line
            points={[
              new THREE.Vector3(-half, 0.001, -half),
              new THREE.Vector3(-half, 0.001, half),
            ]}
            color="#3fb950"
            lineWidth={2}
          />
          <Line
            points={[
              new THREE.Vector3(-half, 0, -half),
              new THREE.Vector3(-half, height, -half),
            ]}
            color="#2f81f7"
            lineWidth={2}
          />
        </>
      )}

      {tickLabels.map((label, i) => (
        <Text
          key={i}
          position={label.position}
          fontSize={0.06}
          color={labelColor}
          anchorX="center"
          anchorY="middle"
          rotation={label.rotation}
        >
          {label.text}
        </Text>
      ))}

      {showLabels && (
        <>
          <Text
            position={[0, -0.04, half + 0.4]}
            fontSize={0.09}
            color="#f85149"
            anchorX="center"
            anchorY="middle"
          >
            α
          </Text>
          <Text
            position={[-half - 0.4, -0.04, 0]}
            fontSize={0.09}
            color="#3fb950"
            anchorX="center"
            anchorY="middle"
          >
            β
          </Text>
          <Text
            position={[-half - 0.45, height / 2, -half]}
            fontSize={0.09}
            color="#2f81f7"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, Math.PI / 2]}
          >
            Loss
          </Text>
        </>
      )}
    </group>
  );
}
