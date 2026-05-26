"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import type { ColorMode } from "@/lib/landscape";
import styles from "./Explorer.module.scss";

interface ExplorerControlsProps {
  architecture: string;
  onArchitectureChange: (value: string) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  showTrajectory: boolean;
  onShowTrajectoryChange: (show: boolean) => void;
}

export function ExplorerControls({
  architecture,
  onArchitectureChange,
  colorMode,
  onColorModeChange,
  showTrajectory,
  onShowTrajectoryChange,
}: ExplorerControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.controlGroup}>
        <label className={styles.label}>Architecture</label>
        <Tabs.Root
          value={architecture}
          onValueChange={onArchitectureChange}
          className={styles.tabs}
        >
          <Tabs.List className={styles.tabsList}>
            <Tabs.Trigger value="resnet56_short" className={styles.tabsTrigger}>
              ResNet (Skip)
            </Tabs.Trigger>
            <Tabs.Trigger
              value="resnet56_noshort"
              className={styles.tabsTrigger}
            >
              ResNet (No Skip)
            </Tabs.Trigger>
            <Tabs.Trigger value="vgg9" className={styles.tabsTrigger}>
              VGG-9
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>Colormap</label>
        <Tabs.Root
          value={colorMode}
          onValueChange={(v) => onColorModeChange(v as ColorMode)}
          className={styles.tabs}
        >
          <Tabs.List className={styles.tabsList}>
            <Tabs.Trigger value="jet" className={styles.tabsTrigger}>
              Jet
            </Tabs.Trigger>
            <Tabs.Trigger value="turbo" className={styles.tabsTrigger}>
              Turbo
            </Tabs.Trigger>
            <Tabs.Trigger value="gradient" className={styles.tabsTrigger}>
              Gradient
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>Show Trajectory</label>
        <div className={styles.switchRow}>
          <span className={!showTrajectory ? styles.active : ""}>Off</span>
          <Switch.Root
            checked={showTrajectory}
            onCheckedChange={onShowTrajectoryChange}
            className={styles.switch}
          >
            <Switch.Thumb className={styles.switchThumb} />
          </Switch.Root>
          <span className={showTrajectory ? styles.active : ""}>On</span>
        </div>
      </div>
    </div>
  );
}

export default function Explorer() {
  return (
    <section id="chapter-explorer" className={styles.explorerSection}>
      <div className={styles.scrollHint}>
        <div className={styles.scrollHintLine} />
        <span>Scroll to continue</span>
      </div>
    </section>
  );
}
