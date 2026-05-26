"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { ChapterId } from "@/lib/landscape";
import { CHAPTER_ORDER } from "@/lib/landscape";

interface ScrollState {
  globalProgress: number;
  activeChapter: ChapterId;
  chapterProgress: Map<ChapterId, number>;
}

export function useScrollProgress() {
  const [state, setState] = useState<ScrollState>({
    globalProgress: 0,
    activeChapter: "hero",
    chapterProgress: new Map(CHAPTER_ORDER.map((id) => [id, 0])),
  });

  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  const initScrollTriggers = useCallback(() => {
    scrollTriggersRef.current.forEach((st) => st.kill());
    scrollTriggersRef.current = [];

    const totalChapters = CHAPTER_ORDER.length;
    const progressMap = new Map<ChapterId, number>(
      CHAPTER_ORDER.map((id) => [id, 0])
    );
    const visibilityMap = new Map<ChapterId, number>(
      CHAPTER_ORDER.map((id) => [id, 0])
    );

    const recomputeState = () => {
      let activeChapter: ChapterId = CHAPTER_ORDER[0];

      for (let i = CHAPTER_ORDER.length - 1; i >= 0; i--) {
        const id = CHAPTER_ORDER[i];
        const visibility = visibilityMap.get(id) ?? 0;
        if (visibility > 0.1) {
          activeChapter = id;
          break;
        }
      }

      const activeIdx = CHAPTER_ORDER.indexOf(activeChapter);
      const activeProgress = progressMap.get(activeChapter) ?? 0;
      const globalProgress = (activeIdx + activeProgress) / totalChapters;

      setState({
        globalProgress,
        activeChapter,
        chapterProgress: new Map(progressMap),
      });
    };

    CHAPTER_ORDER.forEach((chapterId) => {
      const element = document.getElementById(`chapter-${chapterId}`);
      if (!element) return;

      const visibilityTrigger = ScrollTrigger.create({
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          visibilityMap.set(chapterId, self.progress);
          recomputeState();
        },
      });

      const progressTrigger = ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        scrub: true,
        onUpdate: (self) => {
          progressMap.set(chapterId, self.progress);
          recomputeState();
        },
      });

      scrollTriggersRef.current.push(visibilityTrigger);
      scrollTriggersRef.current.push(progressTrigger);
    });

    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(initScrollTriggers, 100);

    return () => {
      clearTimeout(timeoutId);
      scrollTriggersRef.current.forEach((st) => st.kill());
    };
  }, [initScrollTriggers]);

  const getChapterProgress = useCallback(
    (chapterId: ChapterId): number => {
      return state.chapterProgress.get(chapterId) ?? 0;
    },
    [state.chapterProgress]
  );

  return {
    globalProgress: state.globalProgress,
    activeChapter: state.activeChapter,
    getChapterProgress,
    refresh: () => ScrollTrigger.refresh(),
  };
}
