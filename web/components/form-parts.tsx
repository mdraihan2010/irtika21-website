"use client";

import Link from "next/link";
import { PAYMENT, PAY_METHODS, SIZES, SIZES_CONFIRMED, type PayMethod } from "@/lib/content";
import type { TKey } from "@/lib/i18n";
import type { Errors } from "@/lib/validation";
import { normalizeTrx } from "@/lib/validation";
import { useLang } from "./lang";
import { useCopy } from "./ui";

export function StepBar({ labels, current }: { labels: string[]; current: number }) {
  const { t, n } = useLang();
  return (
    <ol className="my-6 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0,1fr))` }}>
      {labels.map((label, i) => {
        const s = i + 1;
        const state = s < current ? "done" : s === current ? "current" : "todo";
        return (
          <li
            key={label}
            aria-current={state === "current" ? "step" : undefined}
            className={`border-t-4 pt-2 text-sm ${
              state === "done" ? "border-ink text-ink" : state === "current" ? "border-gold font-semibold text-ink" : "border-line text-muted"
            }`}
          >
            <span className="block font-mono text-xs tabular-nums">
              {t("step")} {n(s)}
            </span>
            <span className={state === "current" ? "" : "max-sm:sr-only"}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: TKey;
  hint?: string;
  optional?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">;

export function Field({ id, label, value, onChange, error, hint, optional, className = "", ...rest }: FieldProps) {
  const { t } = useLang();
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {optional && <span className="ml-1 text-sm font-normal text-muted">({t("optional")})</span>}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-msg`}
        className="input"
        {...rest}
      />
      <span id={`${id}-msg`} className={`text-sm ${error ? "text-danger" : "text-muted"}`}>
        {error ? t(error) : hint}
      </span>
    </div>
  );
}

export function SizePicker({ value, onChange, error, showTable = true }: { value: string; onChange: (s: string) => void; error?: TKey; showTable?: boolean }) {
  const { t, n } = useLang();
  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label={t("size")} aria-invalid={error ? true : undefined} className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-2">
        {SIZES.map(([s]) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            onClick={() => onChange(s)}
            className={`min-h-[52px] rounded-xl border-[1.5px] font-mono text-lg ${
              value === s ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{t(error)}</p>}
      {showTable && (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[320px] text-left">
            <thead className="bg-sunk text-sm">
              <tr>
                <th className="px-4 py-2.5 font-semibold">{t("size")}</th>
                <th className="px-4 py-2.5 font-semibold">{t("length")}</th>
                <th className="px-4 py-2.5 font-semibold">{t("chest")}</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map(([s, len, chest]) => (
                <tr key={s} className={`border-t border-line ${value === s ? "bg-gold-soft" : ""}`}>
                  <td className="px-4 py-2.5 font-semibold">{s}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{n(len)}″</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{n(chest)}″</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showTable && !SIZES_CONFIRMED && <p className="text-sm text-gold-ink">{t("sizeNote")}</p>}
    </div>
  );
}

type PayState = { method: PayMethod; sender: string; trx: string };

export function PaymentFields({
  state,
  total,
  errors,
  onChange,
}: {
  state: PayState;
  total: number;
  errors: Errors;
  onChange: (patch: Partial<PayState>) => void;
}) {
  const { t, money } = useLang();
  const copy = useCopy();
  const number = PAYMENT[state.method];

  const pasteTrx = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange({ trx: normalizeTrx(text).slice(0, 14) });
    } catch {
      document.getElementById("trx")?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 font-semibold">{t("method")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {PAY_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={state.method === m}
              onClick={() => onChange({ method: m })}
              className={`min-h-[60px] rounded-xl border-[1.5px] px-3 py-2 text-left ${
                state.method === m ? "border-ink bg-gold-soft" : "border-line bg-paper hover:border-ink"
              }`}
            >
              <b className="block">{t(m)}</b>
              <span className="text-xs text-muted">{t("sendMoney")}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <ol className="flex list-decimal flex-col gap-1 pl-5 text-muted marker:font-semibold marker:text-ink">
        <li>{t("how1")}</li>
        <li>
          {t("how2")} <b className="whitespace-nowrap font-mono text-ink">{money(total)}</b>
        </li>
        <li>{t("how3")}</li>
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-gold p-4">
        <div>
          <p className="text-sm text-muted">
            {t("sendTo")} · {t(state.method)}
          </p>
          <p className="select-all font-mono text-2xl tracking-wide tabular-nums">{number}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => copy(number)}>
          {t("copy")}
        </button>
      </div>
      <p className="-mt-2 text-sm text-gold-ink">{t("chargeNote")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="sender"
          label={t("fSender")}
          value={state.sender}
          onChange={(v) => onChange({ sender: v })}
          error={errors.sender}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          maxLength={14}
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="trx" className="font-semibold">{t("fTrx")}</label>
          <div className="flex gap-2">
            <input
              id="trx"
              name="trx"
              value={state.trx}
              onChange={(e) => onChange({ trx: normalizeTrx(e.target.value) })}
              aria-invalid={errors.trx ? true : undefined}
              aria-describedby="trx-msg"
              className="input min-w-0 font-mono text-lg uppercase tracking-wider"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={14}
              placeholder="ABC12DEF34"
            />
            <button type="button" className="btn btn-ghost shrink-0 px-4" onClick={pasteTrx}>
              {t("paste")}
            </button>
          </div>
          <span id="trx-msg" className={`text-sm ${errors.trx ? "text-danger" : "text-muted"}`}>
            {errors.trx ? t(errors.trx) : t("trxHint")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Summary({ rows, total, refCode }: { rows: [string, string][]; total: number; refCode: string }) {
  const { t, money } = useLang();
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-sunk p-5">
      <p className="font-semibold">{t("sum")}</p>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 text-sm">
          <span className="text-muted">{k}</span>
          <span className="min-w-0 break-words text-right">{v}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold">
        <span>{t("total")}</span>
        <span className="font-mono tabular-nums">{money(total)}</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {t("ref")}: <span className="font-mono">{refCode}</span>
      </p>
    </div>
  );
}

export function DoneCard({ refCode, message, againLabel, onAgain, demo }: { refCode: string; message: string; againLabel: string; onAgain: () => void; demo?: boolean }) {
  const { t } = useLang();
  const copy = useCopy();
  return (
    <div className="panel mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="text-ok" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M7 12.5l3.2 3L17 9" />
      </svg>
      <h2 className="font-display text-2xl font-bold">{t("doneH")}</h2>
      <span className="rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold text-gold-ink">{t("pending")}</span>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="select-all rounded-xl bg-sunk px-4 py-2 font-mono text-xl tracking-wide">{refCode}</span>
        <button type="button" className="btn btn-ghost" onClick={() => copy(refCode)}>{t("copy")}</button>
      </div>
      <p className="max-w-[50ch] text-muted">{message}</p>
      {demo && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{t("demoNote")}</p>}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">{t("backHome")}</Link>
        <button type="button" className="btn btn-ghost" onClick={onAgain}>{againLabel}</button>
      </div>
    </div>
  );
}

export function FormFooterNote({ onClear }: { onClear: () => void }) {
  const { t } = useLang();
  return (
    <p className="mt-5 text-sm text-muted">
      {t("autosaved")}{" "}
      <button type="button" onClick={onClear} className="underline underline-offset-4 hover:text-ink">
        {t("clearMine")}
      </button>
    </p>
  );
}

/** Hidden field that only bots fill in */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export type SubmitResult = { kind: "ok"; demo?: boolean } | { kind: "error"; key: TKey; fields?: Errors };

export async function postJson(url: string, body: unknown): Promise<SubmitResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; demo?: boolean; error?: string; fields?: Errors };
    if (res.ok && data.ok) return { kind: "ok", demo: data.demo };
    if (data.error === "trx_used") return { kind: "error", key: "e_trxUsed", fields: { trx: "e_trxUsed" } };
    if (data.error === "invalid") return { kind: "error", key: "e_fix", fields: data.fields };
    return { kind: "error", key: "e_server" };
  } catch {
    return { kind: "error", key: "e_network" };
  }
}

export function focusFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
  });
}
