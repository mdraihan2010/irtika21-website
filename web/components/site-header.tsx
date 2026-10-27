"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { TKey } from "@/lib/i18n";
import { useLang } from "./lang";
import { ThemeToggle } from "./theme-toggle";

const NAV: { href: string; k: TKey }[] = [
  { href: "/", k: "nHome" },
  { href: "/#about", k: "nAbout" },
  { href: "/#events", k: "nEvents" },
  { href: "/#gifts", k: "nGifts" },
  { href: "/shop", k: "nShop" },
  { href: "#contact", k: "nContact" },
];

export function SiteHeader() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close the mobile menu after navigating
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset menu on route change
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-[env(safe-area-inset-top)] z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="gutter mx-auto flex min-h-16 max-w-6xl items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={t("title")}>
          <Image src="/images/logo-mark.png" alt="" width={34} height={42} className="logo-light h-10 w-auto" priority />
          <Image src="/images/logo-mark-dark.png" alt="" width={34} height={42} className="logo-dark h-10 w-auto" priority />
          <span className="font-display text-xl leading-none max-[460px]:sr-only">{t("title")}</span>
        </Link>

        <nav
          id="main-nav"
          aria-label="Main"
          className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col border-b border-line bg-surface px-[max(16px,env(safe-area-inset-left))] pb-3 pt-1 lg:static lg:ml-auto lg:flex lg:flex-row lg:border-0 lg:bg-transparent lg:p-0`}
        >
          {NAV.map((item) => (
            <Link
              key={item.k}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 font-medium text-muted hover:bg-sunk hover:text-ink lg:py-2"
            >
              {t(item.k)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="btn btn-ghost min-w-11 px-3"
            aria-label={t("langLabel")}
            lang={lang === "bn" ? "en" : "bn"}
          >
            {t("langSwitch")}
          </button>
          <Link href="/register" className="btn btn-primary px-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="max-[420px]:sr-only">{t("register")}</span>
          </Link>
          <button
            type="button"
            className="btn btn-ghost px-3 lg:hidden"
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? t("closeMenu") : t("menu")}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
