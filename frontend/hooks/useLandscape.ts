"use client";

import { useState, useEffect, useMemo } from "react";
import type { LandscapeData } from "@/lib/landscape";

const landscapeCache = new Map<string, LandscapeData>();

export function useLandscape(id: string) {
  const cachedData = useMemo(() => landscapeCache.get(id) ?? null, [id]);

  const [data, setData] = useState<LandscapeData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (landscapeCache.has(id)) {
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/landscapes/${id}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch landscape: ${id}`);
        }
        const json: LandscapeData = await response.json();

        if (!cancelled) {
          landscapeCache.set(id, json);
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}
