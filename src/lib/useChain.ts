'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Poll a contract view. Returns data, error, loading and a manual refresh. */
export function useChain<T>(fetcher: () => Promise<T>, deps: unknown[], intervalMs = 8000) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refresh = useCallback(async () => {
    try {
      const v = await fetcherRef.current();
      setData(v);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deps changed: run the latest fetcher right away (fetcherRef is updated by the effect above).
    fetcherRef.current = fetcher;
    refresh();
    if (!intervalMs) return;
    const t = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') refresh();
    }, intervalMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intervalMs, refresh]);

  return { data, error, loading, refresh };
}

/** Current time that ticks, rendered only after mount to keep prerendering deterministic. */
export function useNow(tickMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), tickMs);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [tickMs]);
  return now;
}
