"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { ChapterId } from "@/lib/landscape";
import styles from "./ChapterLayout.module.scss";

interface ChapterLayoutProps {
  id: ChapterId;
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  fullHeight?: boolean;
}

export default function ChapterLayout({
  id,
  children,
  className,
  align = "left",
  fullHeight = true,
}: ChapterLayoutProps) {
  return (
    <section
      id={`chapter-${id}`}
      className={`${styles.chapter} ${styles[align]} ${fullHeight ? styles.fullHeight : ""} ${className ?? ""}`}
    >
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
