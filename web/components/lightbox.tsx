"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { useLang } from "./lang";

export type LightboxItem = { src: string; caption: string };

/**
 * Full-screen photo viewer: arrows / keyboard ← → / swipe on phones, Esc or tap outside to close.
 */
export function Lightbox({ items, index, onChange }: { items: LightboxItem[]; index: number | null; onChange: (i: number | null) => void }) {
  const { t, n } = useLang();
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = items.length;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onChange((index + delta + count) % count);
    },
    [index, count, onChange],
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const item = index !== null ? items[index] : null;

  return (
    <dialog
      ref={ref}
      onClose={() => onChange(null)}
      onClick={(e) => e.target === e.currentTarget && onChange(null)}
      aria-label={item?.caption}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#0b0b0a] p-0 text-white backdrop:bg-black"
    >
      {item && (
        <div
          className="flex h-full flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          onClick={(e) => e.target === e.currentTarget && onChange(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          {/* top bar */}
          <div className="flex items-center justify-between gap-3 px-[max(16px,env(safe-area-inset-left))] py-3">
            <span className="font-mono text-sm tabular-nums text-white/70">
              {n(index! + 1)} / {n(count)}
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label={t("close")}
              autoFocus
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* photo */}
          <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && onChange(null)}>
            <Image key={item.src} src={item.src} alt={item.caption} fill sizes="100vw" className="object-contain" priority />
            {count > 1 && (
              <>
                <NavButton side="left" label="←" aria={t("photoPrev")} onClick={() => go(-1)} />
                <NavButton side="right" label="→" aria={t("photoNext")} onClick={() => go(1)} />
              </>
            )}
          </div>

          <p className="px-4 py-4 text-center text-base">{item.caption}</p>
        </div>
      )}
    </dialog>
  );
}

function NavButton({ side, label, aria, onClick }: { side: "left" | "right"; label: string; aria: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-xl ring-1 ring-white/20 hover:bg-black/70 ${
        side === "left" ? "left-[max(12px,env(safe-area-inset-left))]" : "right-[max(12px,env(safe-area-inset-right))]"
      }`}
    >
      {label}
    </button>
  );
}
