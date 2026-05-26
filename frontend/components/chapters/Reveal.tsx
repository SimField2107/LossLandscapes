"use client";

import ChapterLayout from "./ChapterLayout";
import styles from "./Reveal.module.scss";

export default function Reveal() {
  return (
    <ChapterLayout id="reveal" align="center">
      <div className={styles.content}>
        <span className={styles.chapterNumber}>04</span>
        <h2 className={styles.heading}>The Reveal</h2>

        <p className={styles.lead}>
          Watch the landscape transform as we toggle{" "}
          <strong>skip connections</strong>.
        </p>

        <div className={styles.comparisonGrid}>
          <div className={styles.architectureCard}>
            <div className={styles.cardHeader}>
              <span className={styles.badge}>Without Skip</span>
            </div>
            <h3>ResNet-56</h3>
            <p>
              <strong>Chaotic</strong> — riddled with local minima and sharp
              ridges. Optimization is treacherous.
            </p>
          </div>

          <div className={styles.arrow}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          <div className={styles.architectureCard}>
            <div className={styles.cardHeader}>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                With Skip
              </span>
            </div>
            <h3>ResNet-56</h3>
            <p>
              <strong>Smooth</strong> — a gentle bowl with clear gradients
              pointing toward the minimum.
            </p>
          </div>
        </div>

        <p className={styles.insight}>
          This is why ResNets train so much better than plain networks. Skip
          connections fundamentally reshape the optimization landscape.
        </p>
      </div>
    </ChapterLayout>
  );
}
