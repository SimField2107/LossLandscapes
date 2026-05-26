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

export type ColorMode = "loss" | "gradient";

export interface ChapterProgress {
  chapterId: ChapterId;
  progress: number;
  isActive: boolean;
}

export const CHAPTER_ORDER: ChapterId[] = [
  "hero",
  "problem",
  "method",
  "normalization",
  "reveal",
  "trajectory",
  "explorer",
  "citation",
];

export function normalizeGrid(grid: number[][]): number[][] {
  let min = Infinity;
  let max = -Infinity;

  for (const row of grid) {
    for (const val of row) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  const range = max - min || 1;

  return grid.map((row) => row.map((val) => (val - min) / range));
}

export function gridToFloat32Array(grid: number[][]): Float32Array {
  const size = grid.length;
  const data = new Float32Array(size * size);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      data[i * size + j] = grid[i][j];
    }
  }

  return data;
}
