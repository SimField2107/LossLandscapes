"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import ChapterLayout from "./ChapterLayout";
import styles from "./Explorer.module.scss";

interface ExplorerControlsProps {
  architecture: string;
  onArchitectureChange: (value: string) => void;
  colorMode: "loss" | "gradient";
  onColorModeChange: (mode: "loss" | "gradient") => void;
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
        <label className={styles.label}>Color Mode</label>
        <div className={styles.switchRow}>
          <span className={colorMode === "loss" ? styles.active : ""}>
            Loss
          </span>
          <Switch.Root
            checked={colorMode === "gradient"}
            onCheckedChange={(checked) =>
              onColorModeChange(checked ? "gradient" : "loss")
            }
            className={styles.switch}
          >
            <Switch.Thumb className={styles.switchThumb} />
          </Switch.Root>
          <span className={colorMode === "gradient" ? styles.active : ""}>
            Gradient
          </span>
        </div>
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
    <ChapterLayout id="explorer" align="center">
      <div className={styles.content}>
        <span className={styles.chapterNumber}>06</span>
        <h2 className={styles.heading}>Interactive Explorer</h2>

        <p className={styles.lead}>
          Now it&apos;s your turn. Explore the loss landscapes freely.
        </p>

        <div className={styles.instructions}>
          <div className={styles.instruction}>
            <span className={styles.icon}>🖱️</span>
            <span>Drag to rotate</span>
          </div>
          <div className={styles.instruction}>
            <span className={styles.icon}>🔍</span>
            <span>Scroll to zoom</span>
          </div>
          <div className={styles.instruction}>
            <span className={styles.icon}>⚙️</span>
            <span>Use controls to switch architectures</span>
          </div>
        </div>

        <p className={styles.note}>
          The controls above the visualization let you switch between different
          neural network architectures and color modes. Watch how the landscape
          changes dramatically based on architectural choices.
        </p>
      </div>
    </ChapterLayout>
  );
}
