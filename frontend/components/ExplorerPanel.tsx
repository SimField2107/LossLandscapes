"use client";

import { ExplorerControls } from "./chapters/Explorer";
import type { ColorMode } from "@/lib/landscape";
import styles from "./ExplorerPanel.module.scss";

interface ExplorerPanelProps {
  visible: boolean;
  architecture: string;
  onArchitectureChange: (value: string) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  showTrajectory: boolean;
  onShowTrajectoryChange: (show: boolean) => void;
}

export default function ExplorerPanel({
  visible,
  architecture,
  onArchitectureChange,
  colorMode,
  onColorModeChange,
  showTrajectory,
  onShowTrajectoryChange,
}: ExplorerPanelProps) {
  if (!visible) return null;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.chapterLabel}>02 · Explorer</span>
        <h2 className={styles.chapterTitle}>Interactive Playground</h2>
        <p className={styles.chapterDescription}>
          The graph is yours. Rotate, zoom, and switch architectures to compare
          their landscapes side by side.
        </p>
      </div>

      <ExplorerControls
        architecture={architecture}
        onArchitectureChange={onArchitectureChange}
        colorMode={colorMode}
        onColorModeChange={onColorModeChange}
        showTrajectory={showTrajectory}
        onShowTrajectoryChange={onShowTrajectoryChange}
      />

      <div className={styles.hint}>
        <span className={styles.hintBullet} />
        <span>
          <strong>Drag</strong> to rotate, <strong>scroll</strong> to zoom,{" "}
          <strong>right-click drag</strong> to pan.
        </span>
      </div>
    </aside>
  );
}
