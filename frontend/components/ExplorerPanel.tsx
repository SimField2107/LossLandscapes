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
    <div className={styles.panel}>
      <ExplorerControls
        architecture={architecture}
        onArchitectureChange={onArchitectureChange}
        colorMode={colorMode}
        onColorModeChange={onColorModeChange}
        showTrajectory={showTrajectory}
        onShowTrajectoryChange={onShowTrajectoryChange}
      />
    </div>
  );
}
