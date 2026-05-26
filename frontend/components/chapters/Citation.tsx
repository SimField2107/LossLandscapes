"use client";

import { useState } from "react";
import ChapterLayout from "./ChapterLayout";
import styles from "./Citation.module.scss";

const BIBTEX = `@inproceedings{li2018visualizing,
  title={Visualizing the Loss Landscape of Neural Nets},
  author={Li, Hao and Xu, Zheng and Taylor, Gavin and Studer, Christoph and Goldstein, Tom},
  booktitle={Advances in Neural Information Processing Systems},
  pages={6389--6399},
  year={2018}
}`;

export default function Citation() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <ChapterLayout id="citation" align="center" fullHeight={false}>
      <div className={styles.content}>
        <span className={styles.chapterNumber}>07</span>
        <h2 className={styles.heading}>Citation & Resources</h2>

        <div className={styles.paper}>
          <h3>Original Paper</h3>
          <p className={styles.paperTitle}>
            &ldquo;Visualizing the Loss Landscape of Neural Nets&rdquo;
          </p>
          <p className={styles.authors}>
            Hao Li, Zheng Xu, Gavin Taylor, Christoph Studer, Tom Goldstein
          </p>
          <p className={styles.venue}>NeurIPS 2018</p>
          <a
            href="https://arxiv.org/pdf/1712.09913"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Read Paper (arXiv)
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>

        <div className={styles.bibtex}>
          <div className={styles.bibtexHeader}>
            <h3>BibTeX</h3>
            <button onClick={handleCopy} className={styles.copyButton}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className={styles.code}>{BIBTEX}</pre>
        </div>

        <div className={styles.links}>
          <a
            href="https://github.com/tomgoldstein/loss-landscape"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.resourceLink}
          >
            <span className={styles.resourceIcon}>📦</span>
            <span>
              <strong>Official Code</strong>
              <small>github.com/tomgoldstein/loss-landscape</small>
            </span>
          </a>
        </div>

        <footer className={styles.footer}>
          <p>
            This interactive visualization was created to help understand the
            key insights from the original research. It demonstrates how
            architectural choices—particularly skip connections—fundamentally
            affect the optimization landscape of neural networks.
          </p>
        </footer>
      </div>
    </ChapterLayout>
  );
}
