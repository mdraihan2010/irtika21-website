"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { DICTS, formatMoney, toLangDigits, type Lang, type TKey } from "@/lib/i18n";

const KEY = "irtika.lang";
const listeners = new Set<() => void>();

function readLang(): Lang {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "bn";
  } catch {
    return "bn";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  n: (v: string | number) => string;
  money: (amount: number) => string;
};
const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Server renders Bangla; the browser switches to the saved choice right after hydration.
  const lang = useSyncExternalStore(subscribe, readLang, () => "bn" as Lang);

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(KEY, l);
    } catch {}
    listeners.forEach((cb) => cb());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => DICTS[lang][k],
      n: (v) => toLangDigits(v, lang),
      money: (a) => formatMoney(a, lang),
    }),
    [lang, setLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}

/** Inline text in the current language: <T k="register" /> */
export function T({ k }: { k: TKey }) {
  return <>{useLang().t(k)}</>;
}
