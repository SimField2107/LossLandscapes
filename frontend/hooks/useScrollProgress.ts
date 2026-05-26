"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ChapterId } from "@/lib/landscape";
import { CHAPTER_ORDER } from "@/lib/landscape";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

    CHAPTER_ORDER.forEach((chapterId, index) => {
      const element = document.getElementById(`chapter-${chapterId}`);
      if (!element) return;

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        scrub: true,
        onUpdate: (self) => {
          setState((prev) => {
            const newProgress = new Map(prev.chapterProgress);
            newProgress.set(chapterId, self.progress);

            const globalProgress =
              (index + self.progress) / totalChapters;

            return {
              globalProgress,
              activeChapter:
                self.progress > 0.1 ? chapterId : prev.activeChapter,
              chapterProgress: newProgress,
            };
          });
        },
      });

      scrollTriggersRef.current.push(trigger);
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

  const isChapterActive = useCallback(
    (chapterId: ChapterId): boolean => {
      return state.activeChapter === chapterId;
    },
    [state.activeChapter]
  );

  return {
    globalProgress: state.globalProgress,
    activeChapter: state.activeChapter,
    getChapterProgress,
    isChapterActive,
    refresh: () => ScrollTrigger.refresh(),
  };
}

export function useChapterProgress(chapterId: ChapterId) {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const element = document.getElementById(`chapter-${chapterId}`);
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top 80%",
      end: "bottom 20%",
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress);
      },
      onEnter: () => setIsActive(true),
      onLeave: () => setIsActive(false),
      onEnterBack: () => setIsActive(true),
      onLeaveBack: () => setIsActive(false),
    });

    return () => {
      trigger.kill();
    };
  }, [chapterId]);

  return { progress, isActive };
}

export function useScrollTo() {
  const scrollTo = useCallback((chapterId: ChapterId) => {
    const element = document.getElementById(`chapter-${chapterId}`);
    if (!element) return;

    gsap.to(window, {
      scrollTo: { y: element, offsetY: 0 },
      duration: 1.5,
      ease: "power3.inOut",
    });
  }, []);

  return scrollTo;
}
