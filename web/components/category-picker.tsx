"use client";

import { CATEGORIES, MAX_CUSTOM_AMOUNT, type CategoryId } from "@/lib/content";
import type { TKey } from "@/lib/i18n";
import { useLang } from "./lang";
import { GiftIcon, useGiftModal } from "./ui";

const QUICK_AMOUNTS = [349, 500, 1000];
const AMOUNT_STEP = 50;

type Props = {
  value: CategoryId | null;
  amount: string;
  amountError?: TKey;
  onSelect: (id: CategoryId) => void;
  onAmount: (amount: string) => void;
};

/**
 * Step 1: category cards.
 * - The whole card is clickable; a real (hidden) radio input inside gives keyboard
 *   arrow-key navigation and screen-reader support for free.
 * - Gift names open the photo popup (the spec: names first, photos on tap).
 */
export function CategoryPicker({ value, amount, amountError, onSelect, onAmount }: Props) {
  const { t, n, money, lang } = useLang();
  const openGift = useGiftModal();

  const setAmount = (v: number) => onAmount(String(Math.max(0, Math.min(MAX_CUSTOM_AMOUNT, v))));

  return (
    <fieldset>
      <legend className="mb-4 text-muted">{t("pickHint")}</legend>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => {
          const selected = value === c.id;
          const current = Number(amount) || c.fee;
          return (
            <div
              key={c.id}
              onClick={(e) => {
                // clicks on gift names or the amount controls must not re-select
                if ((e.target as HTMLElement).closest("button, input:not([type=radio])")) return;
                onSelect(c.id);
              }}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`cat-card group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border-[1.5px] bg-surface p-5 transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gold/40 ${
                selected
                  ? "border-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,.35)] ring-2 ring-gold"
                  : "border-line hover:-translate-y-1 hover:border-gold hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,.3)]"
              }`}
            >
              {/* gold corner triangle, grows when selected */}
              <span
                aria-hidden
                className={`tri absolute -right-4 -top-4 h-14 w-20 rotate-180 transition-all duration-300 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
              />

              <div className="flex items-start justify-between gap-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="category"
                    value={c.id}
                    checked={selected}
                    onChange={() => onSelect(c.id)}
                    className="peer sr-only"
                  />
                  {/* custom radio dot */}
                  <span
                    aria-hidden
                    className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                      selected ? "border-ink bg-ink text-paper" : "border-line group-hover:border-gold"
                    }`}
                  >
                    {selected && (
                      <svg className="check-pop h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </span>
                  <span className="font-display text-lg font-semibold leading-snug">{t(`c_${c.id}`)}</span>
                </label>
              </div>

              <div className="flex items-baseline gap-2 pl-9">
                <span className={`font-mono text-3xl tabular-nums transition-colors ${selected ? "text-ink" : "text-ink/85"}`}>
                  {money(c.minimumOnly && selected ? Math.max(current, c.fee) : c.fee)}
                </span>
                {c.minimumOnly && <span className="text-sm text-muted">{t("orMore")}</span>}
              </div>

              <div className="pl-9">
                <p className="mb-2 flex items-center gap-2 text-xs text-muted">
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 font-semibold text-gold-ink">
                    {n(c.gifts.length)}
                    {lang === "bn" ? "" : " "}
                    {t("giftWord")}
                  </span>
                  {t("tapGiftHint")}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {c.gifts.map((g) => (
                    <li key={g}>
                      <button
                        type="button"
                        onClick={() => openGift(g)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-paper px-3 text-sm transition-colors hover:border-gold-ink hover:bg-gold-soft hover:text-gold-ink"
                      >
                        <GiftIcon id={g} className="h-4 w-4" />
                        {t(`g_${g}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* "Others": choose your own amount */}
              {c.minimumOnly && selected && (
                <div className="amount-reveal mt-1 flex flex-col gap-2 rounded-xl bg-sunk p-3">
                  <label htmlFor="amount" className="text-sm font-semibold">{t("yourAmt")}</label>
                  <div className="flex items-stretch gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost w-11 shrink-0 bg-surface px-0 text-xl"
                      aria-label={t("amountLess")}
                      disabled={current - AMOUNT_STEP < c.fee}
                      onClick={() => setAmount(current - AMOUNT_STEP)}
                    >
                      −
                    </button>
                    <input
                      id="amount"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => onAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      aria-invalid={amountError ? true : undefined}
                      aria-describedby="amount-msg"
                      className="input min-w-0 text-center font-mono text-xl tabular-nums"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost w-11 shrink-0 bg-surface px-0 text-xl"
                      aria-label={t("amountMore")}
                      onClick={() => setAmount(current + AMOUNT_STEP)}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_AMOUNTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        aria-pressed={Number(amount) === q}
                        onClick={() => setAmount(q)}
                        className={`min-h-9 rounded-full border px-3 font-mono text-sm tabular-nums transition-colors ${
                          Number(amount) === q ? "border-ink bg-ink text-paper" : "border-line bg-surface hover:border-ink"
                        }`}
                      >
                        {money(q)}
                      </button>
                    ))}
                  </div>
                  <span id="amount-msg" className={`text-sm ${amountError ? "text-danger" : "text-muted"}`}>
                    {amountError ? t(amountError) : t("minAmt")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
