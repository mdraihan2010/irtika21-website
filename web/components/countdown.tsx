"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/content";
import { useLang } from "./lang";

const TARGET = new Date(EVENT.startsAt).getTime();

export function Countdown() {
  const { t, n } = useLang();
  const [now, setNow] = useState<number | null>(null); // null on the server: placeholders

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const ms = now === null ? null : TARGET - now;
  if (ms !== null && ms <= 0) {
    return <p className="font-semibold text-gold">{t("cdStarted")}</p>;
  }

  const parts =
    ms === null
      ? ["--", "--", "--", "--"]
      : [Math.floor(ms / 864e5), Math.floor(ms / 36e5) % 24, Math.floor(ms / 6e4) % 60, Math.floor(ms / 1e3) % 60].map((v) =>
          n(String(v).padStart(2, "0")),
        );
  const labels = [t("cdDays"), t("cdHours"), t("cdMin"), t("cdSec")];

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-paper-on-night/90">{t("cdLeft")}</p>
      <div className="grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {parts.map((p, i) => (
          <div
            key={labels[i]}
            className="flex flex-col items-center justify-center rounded-xl border border-gold/40 bg-night px-1 py-3 text-center shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)]"
          >
            <span className="block font-mono text-[clamp(1.5rem,5vw,2.1rem)] font-semibold leading-tight text-gold tabular-nums">
              {p}
            </span>
            <span className="mt-0.5 text-xs font-semibold text-paper-on-night/85">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
