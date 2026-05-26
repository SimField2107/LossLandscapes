declare module "*.glsl" {
  const value: string;
  export default value;
}

declare module "*.vert" {
  const value: string;
  export default value;
}

declare module "*.frag" {
  const value: string;
  export default value;
}

declare module "react-katex" {
  import { FC, ReactNode } from "react";

  interface MathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
  }

  export const InlineMath: FC<MathProps>;
  export const BlockMath: FC<MathProps>;
}

declare module "lenis" {
  interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    orientation?: "vertical" | "horizontal";
    gestureOrientation?: "vertical" | "horizontal" | "both";
    smoothWheel?: boolean;
    touchMultiplier?: number;
    infinite?: boolean;
  }

  export default class Lenis {
    constructor(options?: LenisOptions);
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
    raf(time: number): void;
    destroy(): void;
    scrollTo(
      target: HTMLElement | string | number,
      options?: { offset?: number; duration?: number; easing?: (t: number) => number }
    ): void;
  }
}
