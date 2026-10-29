"use client";

import { CATEGORIES, type CategoryId } from "@/lib/content";
import type { TKey } from "@/lib/i18n";
import { useLang } from "./lang";
import { GiftIcon, useGiftModal } from "./ui";

/* প্রতিটি ক্যাটাগরির নিজস্ব রঙ */
const ACCENT: Record<CategoryId, { solid: string; soft: string }> = {
  // ছেলেদের বিভাগ
  fresher_b: { solid: "#16a34a", soft: "rgba(22,163,74,0.12)" },
  general_b: { solid: "#0891b2", soft: "rgba(8,145,178,0.10)" },
  grad_b: { solid: "#7c3aed", soft: "rgba(124,58,237,0.12)" },
  other_b: { solid: "#64748b", soft: "rgba(100,116,139,0.14)" },
  // মেয়েদের বিভাগ
  fresher_g: { solid: "#16a34a", soft: "rgba(22,163,74,0.12)" },
  general_g: { solid: "#0891b2", soft: "rgba(8,145,178,0.10)" },
  grad_g: { solid: "#db2777", soft: "rgba(219,39,119,0.12)" },
  other_g: { solid: "#64748b", soft: "rgba(100,116,139,0.14)" },
};

type Props = {
  value: CategoryId | null;
  amount: string;
  amountError?: TKey;
  onSelect: (id: CategoryId) => void;
  onAmount: (amount: string) => void;
};

/**
 * Step 1: Category cards.
 * Boys' section first, then girls' section. Each has four category cards.
 * Clicking a card selects it and moves straight to step 2.
 * All visible text comes from lib/i18n.ts so it switches with the language.
 */
export function CategoryPicker({ value, onSelect }: Props) {
  const { t, n, money, lang } = useLang();
  const openGift = useGiftModal();

  const sections = [
    { id: "boys", gender: "boy" as const, titleKey: "boysH" as const, headingColor: "#0891b2" },
    { id: "girls", gender: "girl" as const, titleKey: "girlsH" as const, headingColor: "#db2777" },
  ];

  return (
    <fieldset>
      <legend className="mb-4 text-sm text-muted sm:text-base">{t("pickHint")}</legend>

      <div className="flex flex-col gap-8">
        {sections.map((section) => {
          const cats = CATEGORIES.filter((c) => c.gender === section.gender);
          return (
            <section key={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2
                id={`${section.id}-heading`}
                className="mb-4 flex items-center gap-3 font-display text-lg font-bold sm:text-xl"
                style={{ color: section.headingColor }}
              >
                <span
                  aria-hidden="true"
                  className="h-7 w-1.5 rounded-full"
                  style={{ background: section.headingColor }}
                />
                {t(section.titleKey)}
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {cats.map((c, i) => {
                  const selected = value === c.id;
                  const accent = ACCENT[c.id];
                  const [mainLine, subLine] = t(`c_${c.id}`).split("|");

                  return (
                    <div
                      key={c.id}
                      onClick={(e) => {
                        // গিফট বোতামে ক্লিক করলে নির্বাচন হবে না
                        if ((e.target as HTMLElement).closest("button")) return;
                        onSelect(c.id);
                      }}
                      style={{
                        animationDelay: `${i * 60}ms`,
                        borderLeft: `4px solid ${accent.solid}`,
                        boxShadow: selected
                          ? `0 0 0 2px ${accent.solid}, 0 10px 24px -14px rgba(0,0,0,.4)`
                          : undefined,
                        background: selected ? accent.soft : undefined,
                      }}
                      className={`cat-card group relative flex cursor-pointer flex-col gap-2.5 overflow-hidden rounded-2xl border-[1.5px] border-line bg-surface p-3.5 transition-all duration-200 sm:p-4 ${
                        selected
                          ? ""
                          : "hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-14px_rgba(0,0,0,.3)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        style={{ background: accent.solid }}
                        className={`absolute -right-4 -top-4 h-12 w-16 rotate-45 transition-all duration-300 ${
                          selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                        }`}
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
                          aria-hidden="true"
                          style={
                            selected
                              ? { background: accent.solid, borderColor: accent.solid }
                              : { borderColor: accent.solid }
                          }
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-white transition-colors"
                        >
                          {selected && (
                            <svg
                              className="check-pop h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          )}
                        </span>
                        <span
                          style={{ borderColor: accent.solid }}
                          className="flex min-h-9 flex-1 flex-col justify-center rounded-lg border-[1.5px] bg-paper px-3 py-1.5 font-display leading-tight text-ink"
                        >
                          <span className="text-base font-bold">{mainLine}</span>
                          {subLine && (
                            <span className="text-sm font-semibold text-muted">{subLine}</span>
                          )}
                        </span>
                      </label>

                      {/* বিবরণ */}
                      <p className="font-display px-1 text-sm leading-relaxed text-muted">
                        {t(`cd_${c.id}` as TKey)}
                      </p>

                      {/* টাকা */}
                      <div
                        style={{ borderColor: accent.solid, background: accent.soft }}
                        className="inline-flex w-fit flex-wrap items-baseline gap-1.5 self-start rounded-lg border-[1.5px] px-3 py-1 transition-colors"
                      >
                        <span className="bn-num text-2xl font-semibold text-ink">
                          {money(c.fee)}
                        </span>
                      </div>

                      {/* উপহার */}
                      <div>
                        <p className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                          <span
                            style={{ background: accent.solid }}
                            className="font-display rounded-full px-2 py-0.5 font-semibold text-white"
                          >
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
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </fieldset>
  );
}
