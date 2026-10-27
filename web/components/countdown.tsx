"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/content";
import { useLang } from "./lang";

const TARGET = new Date(EVENT.startsAt).getTime();

export function Countdown() {
  const { t, n } = useLang();
  const [now, setNow] = useState<number | null>(null); // null on the server → placeholders

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const ms = now === null ? null : TARGET - now;
  if (ms !== null && ms <= 0) return <p className="font-semibold text-gold">{t("cdStarted")}</p>;

  const parts =
    ms === null
      ? ["--", "--", "--", "--"]
      : [Math.floor(ms / 864e5), Math.floor(ms / 36e5) % 24, Math.floor(ms / 6e4) % 60, Math.floor(ms / 1e3) % 60].map((v) =>
          n(String(v).padStart(2, "0")),
        );
  const labels = [t("cdDays"), t("cdHours"), t("cdMin"), t("cdSec")];

  return (
    <div>
      <p className="mb-2 text-sm text-night-muted">{t("cdLeft")}</p>
      <div className="grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {parts.map((p, i) => (
          <div key={labels[i]} className="rounded-xl bg-white/[.06] px-1 py-2.5 text-center ring-1 ring-white/10">
            <span className="block font-mono text-[clamp(1.4rem,5vw,2rem)] leading-tight text-gold tabular-nums">{p}</span>
            <span className="text-xs text-night-muted">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
