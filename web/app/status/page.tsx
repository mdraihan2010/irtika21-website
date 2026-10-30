"use client";

import { useState } from "react";
import { useLang } from "@/components/lang";

type Result = { ok: boolean; status?: string; error?: string };

export default function StatusPage() {
  const { t } = useLang();
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    const clean = ref.trim().toUpperCase();
    if (!/^IRT-[RS][A-Z0-9]{8}$/.test(clean)) {
      setResult({ ok: false, error: "bad_ref" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/status?ref=${encodeURIComponent(clean)}`, { cache: "no-store" });
      const data = (await res.json()) as Result;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "network" });
    } finally {
      setBusy(false);
    }
  };

  const message = (() => {
    if (!result) return null;
    if (!result.ok) {
      if (result.error === "bad_ref") return t("statusBadRef");
      if (result.error === "not_found") return t("statusNotFound");
      return t("statusError");
    }
    if (result.status === "verified") return t("payVerified");
    if (result.status === "rejected") return t("payRejected");
    return t("pending");
  })();

  return (
    <div className="gutter mx-auto max-w-xl py-10 sm:py-14">
      <h1 className="font-display text-[clamp(1.9rem,5vw,2.6rem)] font-bold">{t("statusH")}</h1>
      <p className="mt-2 text-muted">{t("statusP")}</p>

      <div className="panel mt-6 flex flex-col gap-4">
        <label htmlFor="ref" className="font-semibold">{t("statusRefLabel")}</label>
        <input
          id="ref"
          value={ref}
          onChange={(e) => setRef(e.target.value.toUpperCase())}
          placeholder="IRT-XXXXXXXXX"
          className="input font-mono text-lg uppercase tracking-wider"
          autoComplete="off"
          spellCheck={false}
          maxLength={20}
        />
        <button type="button" className="btn btn-primary" onClick={check} disabled={busy || !ref.trim()}>
          {busy ? t("submitting") : t("statusCheck")}
        </button>

        {message && (
          <div
            role="status"
            className={`mt-2 rounded-xl px-4 py-3 ${
              result?.ok && result.status === "verified"
                ? "bg-ok/15 text-ok"
                : result?.ok && result.status === "rejected"
                ? "bg-danger-soft text-danger"
                : "bg-gold-soft text-gold-ink"
            }`}
          >
            {result?.ok && result.status === "verified" && <span className="mr-2 font-bold">✓</span>}
            {message}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-muted">{t("statusHint")}</p>
    </div>
  );
}
