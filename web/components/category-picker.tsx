"use client";

import { CATEGORIES, MAX_CUSTOM_AMOUNT, type CategoryId, type Gender } from "@/lib/content";
import type { TKey } from "@/lib/i18n";
import { useLang } from "./lang";
import { GiftIcon, useGiftModal } from "./ui";

const QUICK_AMOUNTS = [499, 600, 1000];
const AMOUNT_STEP = 50;

/* বিভাগ অনুযায়ী রঙ: ছেলে নীল, মেয়ে গোলাপি */
const SECTION_ACCENT: Record<Gender, { solid: string; soft: string; heading: string }> = {
  boy: { solid: "#2563eb", soft: "rgba(37,99,235,0.08)", heading: "boysH" },
  girl: { solid: "#db2777", soft: "rgba(219,39,119,0.08)", heading: "girlsH" },
};

/* ক্যাটাগরির নিজস্ব রঙ (ছেলে ও মেয়ে একই ধরন হলে একই রঙ) */
const KIND_ACCENT: Record<string, string> = {
  fresher: "#16a34a",
  general: "#0891b2",
  grad: "#7c3aed",
  other: "#64748b",
};

type Props = {
  value: CategoryId | null;
  amount: string;
  amountError?: TKey;
  onSelect: (id: CategoryId) => void;
  onAmount: (amount: string) => void;
};

/**
 * Step 1: boys' section first, then girls' section.
 * Each section shows four category cards.
 */
export function CategoryPicker({ value, amount, amountError, onSelect, onAmount }: Props) {
  const { t, n, money, lang } = useLang();
  const openGift = useGiftModal();

  const setAmount = (v: number) => onAmount(String(Math.max(0, Math.min(MAX_CUSTOM_AMOUNT, v))));

  const sections: Gender[] = ["boy", "girl"];

  return (
    <fieldset>
      <legend className="mb-3 text-sm text-muted sm:text-base">{t("pickHint")}</legend>

      <div className="flex flex-col gap-8">
        {sections.map((gender) => {
          const sec = SECTION_ACCENT[gender];
          const cats = CATEGORIES.filter((c) => c.gender === gender);
          return (
            <div key={gender} className="flex flex-col gap-4">
              {/* বিভাগের শিরোনাম */}
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-7 w-1.5 rounded-full" style={{ background: sec.solid }} />
                <h3 className="font-display text-xl font-bold" style={{ color: sec.solid }}>
                  {t(sec.heading as TKey)}
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cats.map((c, i) => {
                  const selected = value === c.id;
                  const accent = KIND_ACCENT[c.kind];
                  const current = Number(amount) || c.fee;
                  return (
                    <div
                      key={c.id}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button, input:not([type=radio])")) return;
                        onSelect(c.id);
                      }}
                      style={{
                        animationDelay: `${i * 60}ms`,
                        borderLeft: `4px solid ${accent}`,
                        boxShadow: selected ? `0 0 0 2px ${accent}` : undefined,
                        background: selected ? sec.soft : undefined,
                      }}
                      className={`cat-card group relative flex cursor-pointer flex-col gap-2.5 overflow-hidden rounded-2xl border-[1.5px] border-line bg-surface p-3.5 transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gold/40 sm:p-4 ${
                        selected ? "" : "hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-14px_rgba(0,0,0,.3)]"
                      }`}
                    >
                      <span
                        aria-hidden
                        style={{ background: accent }}
                        className={`absolute -right-4 -top-4 h-12 w-16 rotate-45 transition-all duration-300 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
                      />

                      {/* শিরোনাম */}
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="radio"
                          name="category"
                          value={c.id}
                          checked={selected}
                          onChange={() => onSelect(c.id)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          style={selected ? { background: accent, borderColor: accent } : { borderColor: accent }}
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-white transition-colors"
                        >
                          {selected && (
                            <svg className="check-pop h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          )}
                        </span>
                        <span
                          style={{ borderColor: accent }}
                          className="flex min-h-9 flex-1 items-center rounded-lg border-[1.5px] bg-paper px-3 py-1.5 font-display text-base font-bold leading-tight text-ink"
                        >
                          {t(`c_${c.id}` as TKey)}
                        </span>
                      </label>

                      {/* বিবরণ */}
                      <p className="px-1 text-sm leading-relaxed text-muted">{t(`cd_${c.id}` as TKey)}</p>

                      {/* টাকা */}
                      <div
                        style={{ borderColor: accent, background: sec.soft }}
                        className="inline-flex w-fit flex-wrap items-baseline gap-1.5 self-start rounded-lg border-[1.5px] px-3 py-1 transition-colors"
                      >
                        <span className="bn-num text-2xl font-semibold text-ink">
                          {money(c.minimumOnly && selected ? Math.max(current, c.fee) : c.fee)}
                        </span>
                        {c.minimumOnly && <span className="text-sm text-muted">{t("orMore")}</span>}
                      </div>

                      {/* উপহার সংখ্যা */}
                      <div>
                        <p className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                          <span style={{ background: accent }} className="font-display rounded-full px-2 py-0.5 font-semibold text-white">
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
                                className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 text-sm transition-colors hover:border-gold-ink hover:bg-gold-soft hover:text-gold-ink"
                              >
                                <GiftIcon id={g} className="h-4 w-4" />
                                {t(`g_${g}`)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* অন্যান্য: নিজের অঙ্ক */}
                      {c.minimumOnly && selected && (
                        <div
                          style={{ borderColor: accent }}
                          className="amount-reveal mt-1 flex flex-col gap-2 rounded-lg border-[1.5px] bg-sunk p-2.5"
                        >
                          <label htmlFor="amount" className="text-sm font-semibold">{t("yourAmt")}</label>
                          <div className="flex items-stretch gap-2">
                            <button
                              type="button"
                              className="btn btn-ghost w-10 shrink-0 bg-surface px-0 text-lg"
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
                              className="input min-w-0 text-center font-mono text-lg tabular-nums"
                            />
                            <button
                              type="button"
                              className="btn btn-ghost w-10 shrink-0 bg-surface px-0 text-lg"
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
                                style={Number(amount) === q ? { background: accent, borderColor: accent, color: "#fff" } : undefined}
                                className={`min-h-8 rounded-full border px-3 font-mono text-sm tabular-nums transition-colors ${
                                  Number(amount) === q ? "" : "border-line bg-surface hover:border-ink"
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
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
