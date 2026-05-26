"use client";

import type { ColorMode } from "@/lib/landscape";
import styles from "./Colorbar.module.scss";

interface ColorbarProps {
  colorMode: ColorMode;
  min?: number;
  max?: number;
  label?: string;
  visible?: boolean;
}

const COLORMAPS: Record<ColorMode, string> = {
  jet: "linear-gradient(to top, #0000ff 0%, #0080ff 12.5%, #00ffff 25%, #00ff80 37.5%, #00ff00 50%, #80ff00 62.5%, #ffff00 75%, #ff8000 87.5%, #ff0000 100%)",
  turbo:
    "linear-gradient(to top, #30123b 0%, #4145ab 10%, #4675ed 20%, #39a2fc 30%, #1bcfd4 40%, #24eca6 50%, #61fc6c 60%, #a4fc3b 70%, #d1e834 80%, #f3c63a 87.5%, #fb8022 92%, #d93806 96%, #7a0403 100%)",
  gradient:
    "linear-gradient(to top, #440154 0%, #46327e 14%, #365c8d 28%, #277f8e 42%, #1fa187 57%, #4ac16d 71%, #a0da39 85%, #fde725 100%)",
};

const LABELS: Record<ColorMode, string> = {
  jet: "Loss",
  turbo: "Loss",
  gradient: "∇L",
};

export default function Colorbar({
  colorMode,
  min = 0,
  max = 1,
  label,
  visible = true,
}: ColorbarProps) {
  if (!visible) return null;

  const displayLabel = label ?? LABELS[colorMode];
  const gradient = COLORMAPS[colorMode];

  const ticks = 5;
  const tickValues: number[] = [];
  for (let i = ticks; i >= 0; i--) {
    tickValues.push(min + ((max - min) * i) / ticks);
  }

  return (
    <div className={styles.colorbar}>
      <div className={styles.label}>{displayLabel}</div>
      <div className={styles.barContainer}>
        <div
          className={styles.bar}
          style={{ background: gradient }}
        />
        <div className={styles.ticks}>
          {tickValues.map((value, i) => (
            <div key={i} className={styles.tick}>
              <span className={styles.tickValue}>{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
