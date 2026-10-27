"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TTL_MS = 48 * 60 * 60 * 1000; // drafts older than 48 hours are discarded

type Stored<T> = { v: T; savedAt: number; scrollY: number };

/**
 * Keeps form state in localStorage so it survives refresh, closing the browser,
 * or leaving for the bKash / Nagad app. Also remembers the scroll position.
 */
export function useDraft<T extends object>(key: string, makeInitial: () => T) {
  const [state, setState] = useState<T>(makeInitial);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const write = useCallback(
    (v: T) => {
      try {
        const data: Stored<T> = { v, savedAt: Date.now(), scrollY: window.scrollY };
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
    },
    [key],
  );

  // 1. Load once in the browser
  useEffect(() => {
    let scrollY = 0;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw) as Stored<T>;
        if (Date.now() - data.savedAt < TTL_MS && data.v) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring browser-only storage after hydration
          setState({ ...makeInitial(), ...data.v });
          setRestored(true);
          scrollY = data.scrollY || 0;
        } else localStorage.removeItem(key);
      }
    } catch {}
    setReady(true);
    if (scrollY) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollY)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 2. Save on every change
  useEffect(() => {
    if (ready) write(state);
  }, [state, ready, write]);

  // 3. Save scroll position when leaving for another app, and while scrolling
  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setTimeout>;
    const save = () => write(stateRef.current);
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(save, 250);
    };
    const onVis = () => document.visibilityState === "hidden" && save();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", save);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", save);
    };
  }, [ready, write]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setRestored(false);
    setState(makeInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { state, setState, ready, restored, setRestored, clear };
}
