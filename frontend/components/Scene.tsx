"use client";

import { useMemo } from "react";
import LossSurface from "./scene/LossSurface";
import CameraRig from "./scene/CameraRig";
import TrajectoryLine from "./scene/TrajectoryLine";
import PlotBox from "./scene/PlotBox";
import { useLandscape } from "@/hooks/useLandscape";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import type { ChapterId, ColorMode, LandscapeData } from "@/lib/landscape";

interface SceneProps {
  activeArchitecture?: string;
  colorMode?: ColorMode;
  showTrajectory?: boolean;
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

function getLossRange(landscape: LandscapeData | null): [number, number] {
  if (!landscape) return [0, 1];

  let min = Infinity;
  let max = -Infinity;
  for (const row of landscape.loss) {
    for (const val of row) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }
  return [min, max];
}

export default function Scene({
  activeArchitecture,
  colorMode = "jet",
  showTrajectory: showTrajectoryProp = false,
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

  const isExplorerActive = activeChapter === "explorer";
  const isCloseUpChapter = activeChapter === "hero" || activeChapter === "explorer";

  const lossRange = useMemo(() => getLossRange(landscapeA), [landscapeA]);

  return (
    <>
      <CameraRig
        progress={globalProgress}
        autoRotate={config.autoRotate}
        autoRotateSpeed={0.3}
        focusMode={isCloseUpChapter}
      />

      <PlotBox
        size={2}
        height={0.85}
        gridDivisions={10}
        alphaRange={landscapeA?.alphaRange ?? [-1, 1]}
        betaRange={landscapeA?.betaRange ?? [-1, 1]}
        lossRange={lossRange}
      />

      <LossSurface
        landscapeA={landscapeA}
        landscapeB={landscapeIdB ? landscapeB : undefined}
        morphProgress={morphProgress}
        heightScale={0.8}
        colorMode={colorMode}
        showGrid={true}
      />

      {showTrajectory && landscapeA?.trajectory && (
        <TrajectoryLine
          trajectory={landscapeA.trajectory}
          landscape={landscapeA}
          heightScale={0.8}
          progress={trajectoryProgress}
          color="#ffffff"
          lineWidth={3}
        />
      )}
    </>
  );
}
