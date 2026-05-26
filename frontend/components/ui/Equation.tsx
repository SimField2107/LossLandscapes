"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import styles from "./Equation.module.scss";

interface EquationProps {
  math: string;
  block?: boolean;
  className?: string;
}

export default function Equation({
  math,
  block = false,
  className,
}: EquationProps) {
  const Component = block ? BlockMath : InlineMath;

  return (
    <span className={`${styles.equation} ${block ? styles.block : ""} ${className ?? ""}`}>
      <Component math={math} />
    </span>
  );
}
