"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/chapters/Hero";
import Problem from "@/components/chapters/Problem";
import Method from "@/components/chapters/Method";
import Normalization from "@/components/chapters/Normalization";
import Reveal from "@/components/chapters/Reveal";
import Trajectory from "@/components/chapters/Trajectory";
import Explorer from "@/components/chapters/Explorer";
import Citation from "@/components/chapters/Citation";
import ExplorerPanel from "@/components/ExplorerPanel";
import Colorbar from "@/components/Colorbar";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import type { ColorMode } from "@/lib/landscape";
import styles from "./page.module.scss";

const LandscapeCanvas = dynamic(
  () => import("@/components/scene/LandscapeCanvas"),
  { ssr: false }
);

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

function PageContent() {
  const { activeChapter } = useScrollProgress();
  const [architecture, setArchitecture] = useState("resnet56_short");
  const [colorMode, setColorMode] = useState<ColorMode>("jet");
  const [showTrajectory, setShowTrajectory] = useState(false);

  const isExplorerActive = activeChapter === "explorer";
  const activeColorMode = isExplorerActive ? colorMode : "jet";
  const isCitation = activeChapter === "citation";

  return (
    <>
      <LandscapeCanvas enablePostProcessing={true}>
        <Scene
          activeArchitecture={isExplorerActive ? architecture : undefined}
          colorMode={activeColorMode}
          showTrajectory={isExplorerActive ? showTrajectory : false}
          enableControls={isExplorerActive}
        />
      </LandscapeCanvas>

      <Colorbar colorMode={activeColorMode} visible={!isCitation} />

      <ExplorerPanel
        visible={isExplorerActive}
        architecture={architecture}
        onArchitectureChange={setArchitecture}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        showTrajectory={showTrajectory}
        onShowTrajectoryChange={setShowTrajectory}
      />

      <main className={styles.main}>
        <Hero />
        <Problem />
        <Method />
        <Normalization />
        <Reveal />
        <Trajectory />
        <Explorer />
        <Citation />
      </main>
    </>
  );
}

export default function Home() {
  return (
    <SmoothScroll>
      <Suspense
        fallback={
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        }
      >
        <PageContent />
      </Suspense>
    </SmoothScroll>
  );
}
