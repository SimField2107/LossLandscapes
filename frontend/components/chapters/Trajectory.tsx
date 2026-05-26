"use client";

import ChapterLayout from "./ChapterLayout";
import styles from "./Trajectory.module.scss";

export default function Trajectory() {
  return (
    <ChapterLayout id="trajectory" align="left">
      <div className={styles.content}>
        <span className={styles.chapterNumber}>05</span>
        <h2 className={styles.heading}>Optimizer Trajectory</h2>

        <p className={styles.lead}>
          Watch SGD navigate the loss landscape in real-time.
        </p>

        <p>
          The glowing path traces the optimizer&apos;s journey from a random
          starting point toward the minimum. On a smooth landscape, the path is
          direct. On a chaotic one, it wanders.
        </p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>~100</span>
            <span className={styles.statLabel}>Training Epochs</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>SGD</span>
            <span className={styles.statLabel}>Optimizer</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>0.1</span>
            <span className={styles.statLabel}>Learning Rate</span>
          </div>
        </div>

        <p className={styles.note}>
          The trajectory is projected onto the same 2D plane as the loss
          surface, showing how the optimizer&apos;s path appears when viewed through
          our visualization lens.
        </p>
      </div>
    </ChapterLayout>
  );
}
