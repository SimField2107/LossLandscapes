"use client";

import ChapterLayout from "./ChapterLayout";
import Equation from "../ui/Equation";
import styles from "./Normalization.module.scss";

export default function Normalization() {
  return (
    <ChapterLayout id="normalization" align="left">
      <div className={styles.content}>
        <span className={styles.chapterNumber}>03</span>
        <h2 className={styles.heading}>Filter-wise Normalization</h2>

        <p className={styles.lead}>
          A crucial insight: random directions must be{" "}
          <strong>normalized</strong> to match the scale of each filter in the
          network.
        </p>

        <p>
          Without normalization, large filters dominate the visualization. With
          filter-wise normalization, each filter contributes proportionally to
          its learned magnitude.
        </p>

        <div className={styles.comparison}>
          <div className={styles.comparisonItem}>
            <h4>Without Normalization</h4>
            <p>
              Random noise overpowers the structure. The landscape appears
              artificially rough.
            </p>
          </div>
          <div className={styles.comparisonItem}>
            <h4>With Normalization</h4>
            <p>
              The true geometry emerges. We can now see meaningful differences
              between architectures.
            </p>
          </div>
        </div>

        <div className={styles.formula}>
          <p>For each filter <Equation math="i" />:</p>
          <Equation
            math="d_i \leftarrow \frac{d_i}{\|d_i\|} \cdot \|\theta^*_i\|"
            block
          />
        </div>
      </div>
    </ChapterLayout>
  );
}
