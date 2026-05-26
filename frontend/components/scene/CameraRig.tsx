"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { lerp } from "@/lib/easing";

interface CameraRigProps {
  progress?: number;
  enableControls?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

interface CameraKeyframe {
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { position: [2.5, 2, 2.5], target: [0, 0, 0] },
  { position: [2, 1.8, 2], target: [0, 0.1, 0] },
  { position: [1.5, 2.5, 1.5], target: [0, 0.2, 0] },
  { position: [0, 3, 0.1], target: [0, 0, 0] },
  { position: [3, 1.5, 0], target: [0, 0.1, 0] },
  { position: [2, 2, 2], target: [0, 0, 0] },
  { position: [2.5, 2, 2.5], target: [0, 0, 0] },
  { position: [2.5, 2, 2.5], target: [0, 0, 0] },
];

function getInterpolatedKeyframe(
  progress: number
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const numKeyframes = CAMERA_KEYFRAMES.length;
  const scaledProgress = progress * (numKeyframes - 1);
  const index = Math.floor(scaledProgress);
  const t = scaledProgress - index;

  const currentKeyframe = CAMERA_KEYFRAMES[Math.min(index, numKeyframes - 1)];
  const nextKeyframe = CAMERA_KEYFRAMES[Math.min(index + 1, numKeyframes - 1)];

  const position = new THREE.Vector3(
    lerp(currentKeyframe.position[0], nextKeyframe.position[0], t),
    lerp(currentKeyframe.position[1], nextKeyframe.position[1], t),
    lerp(currentKeyframe.position[2], nextKeyframe.position[2], t)
  );

  const target = new THREE.Vector3(
    lerp(currentKeyframe.target[0], nextKeyframe.target[0], t),
    lerp(currentKeyframe.target[1], nextKeyframe.target[1], t),
    lerp(currentKeyframe.target[2], nextKeyframe.target[2], t)
  );

  return { position, target };
}

export default function CameraRig({
  progress = 0,
  enableControls = false,
  autoRotate = false,
  autoRotateSpeed = 0.5,
}: CameraRigProps) {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (enableControls) return;

    const { position, target } = getInterpolatedKeyframe(progress);

    camera.position.lerp(position, 0.05);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(target, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={enableControls}
      enablePan={enableControls}
      enableRotate={enableControls}
      autoRotate={autoRotate && !enableControls}
      autoRotateSpeed={autoRotateSpeed}
      minDistance={1}
      maxDistance={10}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
    />
  );
}
