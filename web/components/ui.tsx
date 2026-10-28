"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { GIFTS, type GiftId } from "@/lib/content";
import { useLang } from "./lang";

/* ---------- Drawn icons for gifts without a photo ---------- */
const ICON_PATHS: Record<GiftId, React.ReactNode> = {
  tshirt: <path d="M22 8l-14 8 5 11 7-3v32h24V24l7 3 5-11-14-8c-1 5-5 8-10 8s-9-3-10-8z" />,
  keyring: (
    <>
      <circle cx="20" cy="20" r="11" />
      <path d="M28 28l8 8" />
      <rect x="32" y="32" width="22" height="22" rx="4" transform="rotate(45 43 43)" />
    </>
  ),
  quran: (
    <>
      <path d="M32 14c-6-4-14-5-22-4v40c8-1 16 0 22 4 6-4 14-5 22-4V10c-8-1-16 0-22 4z" />
      <path d="M32 14v40" />
    </>
  ),
  giftpack: (
    <>
      <rect x="10" y="24" width="44" height="30" rx="2" />
      <path d="M8 18h48v8H8zM32 18v36" />
      <path d="M32 18c-4-8-14-10-14-3s10 3 14 3c4 0 14 4 14-3s-10-5-14 3z" />
    </>
  ),
  crest: <path d="M32 6l20 8v14c0 13-9 22-20 28-11-6-20-15-20-28V14z" />,
  uttoriyo: <path d="M20 8c4 6 20 6 24 0M20 8l-6 50h10l6-42M44 8l6 50H40l-6-42" />,
  scarf: (
    <>
      <path d="M32 8c-11 0-18 8-18 19 0 9 5 15 8 18l-4 13h28l-4-13c3-3 8-9 8-18 0-11-7-19-18-19z" />
      <path d="M24 26c2 6 14 6 16 0" />
    </>
  ),
};

export function GiftIcon({ id, className = "" }: { id: GiftId; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" className={className} aria-hidden>
      {ICON_PATHS[id]}
    </svg>
  );
}

/** Photo when available, otherwise an icon on a gold tile */
export function GiftVisual({ id, sizes, priority }: { id: GiftId; sizes: string; priority?: boolean }) {
  const { t } = useLang();
  const img = GIFTS[id].image;
  return (
    <span className="relative block aspect-square w-full overflow-hidden rounded-lg bg-gold-soft">
      {img ? (
        <Image src={img} alt={t(`g_${id}`)} fill sizes={sizes} priority={priority} className="object-contain" />
      ) : (
        <span className="grid h-full place-items-center text-gold-ink">
          <GiftIcon id={id} className="h-1/2 w-1/2" />
        </span>
      )}
    </span>
  );
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(20px+env(safe-area-inset-bottom))] z-[90] flex justify-center px-4">
        {msg && <div className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper shadow-lg">{msg}</div>}
      </div>
    </ToastCtx.Provider>
  );
}

export function useCopy() {
  const toast = useToast();
  const { t } = useLang();
  return useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast(t("copied"));
      } catch {
        toast(t("copyFail"));
      }
    },
    [toast, t],
  );
}

/* ---------- Gift modal ---------- */
const GiftModalCtx = createContext<(id: GiftId) => void>(() => {});
export const useGiftModal = () => useContext(GiftModalCtx);

export function GiftModalProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const [gift, setGift] = useState<GiftId | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (gift && !d.open) d.showModal();
    if (!gift && d.open) d.close();
  }, [gift]);

  return (
    <GiftModalCtx.Provider value={setGift}>
      {children}
      <dialog
        ref={ref}
        onClose={() => setGift(null)}
        onClick={(e) => e.target === ref.current && setGift(null)}
        aria-labelledby="gift-modal-title"
        className="m-auto w-[min(420px,calc(100vw-32px))] rounded-2xl bg-surface p-0 text-ink backdrop:bg-black/60"
      >
        {gift && (
          <div className="flex flex-col gap-3 p-5">
            <GiftVisual id={gift} sizes="420px" priority />
            <h3 id="gift-modal-title" className="font-display text-2xl">{t(`g_${gift}`)}</h3>
            <p className="text-muted">{t(`gd_${gift}`)}</p>
            {!GIFTS[gift].image && <p className="text-sm text-gold-ink">{t("photoSoon")}</p>}
            <button type="button" className="btn btn-primary mt-1" onClick={() => setGift(null)} autoFocus>
              {t("close")}
            </button>
          </div>
        )}
      </dialog>
    </GiftModalCtx.Provider>
  );
}
