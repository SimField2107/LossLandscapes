"use client";

import { useState, useEffect, useMemo } from "react";
import type { LandscapeData, LandscapeManifest } from "@/lib/landscape";

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

export function useManifest() {
  const [manifest, setManifest] = useState<LandscapeManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchManifest = async () => {
      try {
        const response = await fetch("/landscapes/manifest.json");
        if (!response.ok) {
          throw new Error("Failed to fetch manifest");
        }
        const json: LandscapeManifest = await response.json();
        if (!cancelled) {
          setManifest(json);
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

    fetchManifest();

    return () => {
      cancelled = true;
    };
  }, []);

  return { manifest, loading, error };
}

export function preloadLandscape(id: string): Promise<LandscapeData> {
  if (landscapeCache.has(id)) {
    return Promise.resolve(landscapeCache.get(id)!);
  }

  return fetch(`/landscapes/${id}.json`)
    .then((res) => res.json())
    .then((data: LandscapeData) => {
      landscapeCache.set(id, data);
      return data;
    });
}

export function useLandscapePair(id1: string, id2: string) {
  const landscape1 = useLandscape(id1);
  const landscape2 = useLandscape(id2);

  return {
    data1: landscape1.data,
    data2: landscape2.data,
    loading: landscape1.loading || landscape2.loading,
    error: landscape1.error || landscape2.error,
  };
}
