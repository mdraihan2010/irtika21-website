"use client";

import { useLang } from "./lang";

const KEY = "irtika.theme";

/** Runs before the first paint: a saved choice (light or dark) is applied; otherwise light is the default. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

function currentTheme(): "light" | "dark" {
  const set = document.documentElement.getAttribute("data-theme");
  return set === "dark" ? "dark" : "light";
}

/** Light / dark switch. Default is light; the visitor's choice is remembered. */
export function ThemeToggle() {
  const { t } = useLang();

  const toggle = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };

  return (
    <button type="button" onClick={toggle} className="btn btn-ghost w-11 px-0" title={t("themeToggle")} aria-label={t("themeToggle")}>
      <svg className="when-light" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg className="when-dark" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
