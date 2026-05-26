"use client";

import ChapterLayout from "./ChapterLayout";
import Equation from "../ui/Equation";
import styles from "./Method.module.scss";

export default function Method() {
  return (
    <ChapterLayout id="method" align="right">
      <div className={styles.content}>
        <span className={styles.chapterNumber}>02</span>
        <h2 className={styles.heading}>The Method</h2>

        <p className={styles.lead}>
          We create a 2D slice through the high-dimensional loss landscape using
          two random direction vectors.
        </p>

        <div className={styles.equationBlock}>
          <Equation math="f(\alpha, \beta) = L(\theta^* + \alpha\delta + \beta\eta)" block />
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <Equation math="\theta^*" />
            <span>Trained network weights</span>
          </div>
          <div className={styles.legendItem}>
            <Equation math="\delta, \eta" />
            <span>Random direction vectors</span>
          </div>
          <div className={styles.legendItem}>
            <Equation math="\alpha, \beta" />
            <span>Perturbation magnitudes</span>
          </div>
          <div className={styles.legendItem}>
            <Equation math="L" />
            <span>Loss function value</span>
          </div>
        </div>

        <p>
          By sampling <Equation math="L" /> at many points on this 2D plane, we
          build a surface that reveals the <em>local geometry</em> of the loss
          landscape around our trained solution.
        </p>
      </div>
    </ChapterLayout>
  );
}
