export interface TrajectoryPoint {
  alpha: number;
  beta: number;
  loss: number;
}

export interface LandscapeData {
  id: string;
  label: string;
  architecture: string;
  dataset: "cifar10" | "cifar100";
  gridSize: number;
  alphaRange: [number, number];
  betaRange: [number, number];
  loss: number[][];
  gradientMagnitude?: number[][];
  trajectory?: TrajectoryPoint[];
  notes?: string;
}

export interface LandscapeManifest {
  landscapes: {
    id: string;
    label: string;
    architecture: string;
    file: string;
  }[];
  defaultId: string;
}

export type ChapterId =
  | "hero"
  | "problem"
  | "method"
  | "normalization"
  | "reveal"
  | "trajectory"
  | "explorer"
  | "citation";

export type ColorMode = "jet" | "turbo" | "gradient";

export const CHAPTER_ORDER: ChapterId[] = [
  "hero",
  "explorer",
  "problem",
  "method",
  "normalization",
  "reveal",
  "trajectory",
  "citation",
];

export function getGridMinMax(grid: number[][]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  for (const row of grid) {
    for (const val of row) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  return { min, max };
}
