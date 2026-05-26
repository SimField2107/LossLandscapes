"use client";

import LossSurface from "./scene/LossSurface";
import CameraRig from "./scene/CameraRig";
import TrajectoryLine from "./scene/TrajectoryLine";
import { useLandscape } from "@/hooks/useLandscape";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import type { ChapterId, ColorMode } from "@/lib/landscape";

interface SceneProps {
  activeArchitecture?: string;
  colorMode?: ColorMode;
  showTrajectory?: boolean;
  enableControls?: boolean;
}

function getChapterConfig(chapterId: ChapterId) {
  switch (chapterId) {
    case "hero":
    case "problem":
    case "method":
    case "normalization":
      return {
        landscapeA: "resnet56_short",
        landscapeB: null,
        morphProgress: 0,
        showTrajectory: false,
        autoRotate: true,
      };
    case "reveal":
      return {
        landscapeA: "resnet56_noshort",
        landscapeB: "resnet56_short",
        morphProgress: -1,
        showTrajectory: false,
        autoRotate: false,
      };
    case "trajectory":
      return {
        landscapeA: "resnet56_short",
        landscapeB: null,
        morphProgress: 0,
        showTrajectory: true,
        autoRotate: false,
      };
    case "explorer":
    case "citation":
    default:
      return {
        landscapeA: "resnet56_short",
        landscapeB: null,
        morphProgress: 0,
        showTrajectory: false,
        autoRotate: false,
      };
  }
}

export default function Scene({
  activeArchitecture,
  colorMode = "jet",
  showTrajectory: showTrajectoryProp = false,
  enableControls = false,
}: SceneProps) {
  const {
    globalProgress,
    activeChapter,
    getChapterProgress,
  } = useScrollProgress();

  const config = getChapterConfig(activeChapter);

  const landscapeIdA = activeArchitecture || config.landscapeA;
  const landscapeIdB = config.landscapeB;

  const { data: landscapeA } = useLandscape(landscapeIdA);
  const { data: landscapeB } = useLandscape(landscapeIdB || landscapeIdA);

  let morphProgress = config.morphProgress;
  if (config.morphProgress === -1 && activeChapter === "reveal") {
    morphProgress = getChapterProgress("reveal");
  }

  const showTrajectory =
    showTrajectoryProp ||
    (config.showTrajectory && activeChapter === "trajectory");

  const trajectoryProgress =
    activeChapter === "trajectory" ? getChapterProgress("trajectory") : 1;

  const shouldEnableControls =
    enableControls || activeChapter === "explorer";

  return (
    <>
      <CameraRig
        progress={globalProgress}
        enableControls={shouldEnableControls}
        autoRotate={config.autoRotate && !shouldEnableControls}
        autoRotateSpeed={0.3}
      />

      <LossSurface
        landscapeA={landscapeA}
        landscapeB={landscapeIdB ? landscapeB : undefined}
        morphProgress={morphProgress}
        heightScale={0.8}
        colorMode={colorMode}
      />

      {showTrajectory && landscapeA?.trajectory && (
        <TrajectoryLine
          trajectory={landscapeA.trajectory}
          landscape={landscapeA}
          heightScale={0.8}
          progress={trajectoryProgress}
          color="#f59e0b"
          lineWidth={3}
        />
      )}
    </>
  );
}
