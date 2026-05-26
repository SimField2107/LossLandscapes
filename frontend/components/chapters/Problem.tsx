"use client";

import ChapterLayout from "./ChapterLayout";
import styles from "./Problem.module.scss";

export default function Problem() {
  return (
    <ChapterLayout id="problem" align="left">
      <div className={styles.content}>
        <span className={styles.chapterNumber}>01</span>
        <h2 className={styles.heading}>The Problem</h2>

        <p className={styles.lead}>
          A neural network with <strong>millions of parameters</strong> exists
          in an unimaginably high-dimensional space.
        </p>

        <p>
          Training a neural network means finding a set of weights that
          minimizes the <em>loss function</em> — a measure of how wrong the
          network&apos;s predictions are. But how does gradient descent navigate this
          vast, complex terrain?
        </p>

        <p>
          We can&apos;t visualize millions of dimensions directly. But we{" "}
          <em>can</em> slice through this space and see what the landscape looks
          like around a trained network&apos;s solution.
        </p>

        <div className={styles.insight}>
          <div className={styles.insightIcon}>?</div>
          <p>
            Why do some networks train easily while others get stuck? The answer
            lies in the <strong>shape</strong> of their loss landscape.
          </p>
        </div>
      </div>
    </ChapterLayout>
  );
}
