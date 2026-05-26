"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { lerp } from "@/lib/easing";

interface CameraRigProps {
  progress?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  focusMode?: boolean;
}

interface CameraKeyframe {
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { position: [1.6, 1.0, 1.6], target: [0.1, 0.25, 0] },
  { position: [1.6, 1.0, 1.6], target: [0.1, 0.25, 0] },
  { position: [2.5, 1.6, 2.5], target: [0, 0.3, 0] },
  { position: [2.8, 1.8, 2.0], target: [0, 0.3, 0] },
  { position: [2.2, 2.0, 2.8], target: [0, 0.35, 0] },
  { position: [2.6, 1.5, 2.2], target: [0, 0.3, 0] },
  { position: [2.4, 1.8, 2.4], target: [0, 0.3, 0] },
  { position: [2.8, 1.8, 2.8], target: [0, 0.3, 0] },
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

const FOCUS_KEYFRAME: CameraKeyframe = {
  position: [1.6, 1.0, 1.6],
  target: [0.1, 0.25, 0],
};

export default function CameraRig({
  progress = 0,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  focusMode = false,
}: CameraRigProps) {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const [isUserControlling, setIsUserControlling] = useState(false);
  const lastInteractionRef = useRef(0);
  const prevFocusModeRef = useRef(focusMode);

  useEffect(() => {
    if (focusMode && !prevFocusModeRef.current) {
      camera.position.set(...FOCUS_KEYFRAME.position);
      if (controlsRef.current) {
        controlsRef.current.target.set(...FOCUS_KEYFRAME.target);
        controlsRef.current.update();
      }
    }
    prevFocusModeRef.current = focusMode;
  }, [focusMode, camera]);

  useFrame(() => {
    const sinceInteraction = Date.now() - lastInteractionRef.current;
    if (isUserControlling) return;
    if (sinceInteraction < 3000) return;

    let position: THREE.Vector3;
    let target: THREE.Vector3;
    const lerpSpeed = focusMode ? 0.08 : 0.04;

    if (focusMode) {
      position = new THREE.Vector3(...FOCUS_KEYFRAME.position);
      target = new THREE.Vector3(...FOCUS_KEYFRAME.target);
    } else {
      const interp = getInterpolatedKeyframe(progress);
      position = interp.position;
      target = interp.target;
    }

    camera.position.lerp(position, lerpSpeed);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(target, lerpSpeed);
      controlsRef.current.update();
    }
  });

  const handleStart = () => {
    setIsUserControlling(true);
    lastInteractionRef.current = Date.now();
  };

  const handleEnd = () => {
    setIsUserControlling(false);
    lastInteractionRef.current = Date.now();
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enablePan
      enableRotate
      autoRotate={autoRotate && !isUserControlling}
      autoRotateSpeed={autoRotateSpeed}
      minDistance={1.0}
      maxDistance={8}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2.05}
      dampingFactor={0.08}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      panSpeed={0.8}
      screenSpacePanning
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
}
