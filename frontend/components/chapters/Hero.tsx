"use client";

import { motion } from "framer-motion";
import ChapterLayout from "./ChapterLayout";
import styles from "./Hero.module.scss";

export default function Hero() {
  return (
    <ChapterLayout id="hero" align="center">
      <div className={styles.heroContent}>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Visualizing the
        </motion.p>

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Loss Landscape
          <br />
          <span className={styles.highlight}>of Neural Nets</span>
        </motion.h1>

        <motion.p
          className={styles.authors}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Based on the research by{" "}
          <a
            href="https://arxiv.org/pdf/1712.09913"
            target="_blank"
            rel="noopener noreferrer"
          >
            Li, Xu, Taylor, Studer & Goldstein (2018)
          </a>
        </motion.p>

        <motion.div
          className={styles.scrollHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <span>Scroll to explore</span>
          <div className={styles.scrollIcon}>
            <div className={styles.scrollDot} />
          </div>
        </motion.div>
      </div>
    </ChapterLayout>
  );
}
