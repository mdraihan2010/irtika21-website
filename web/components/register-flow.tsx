"use client";

import { useState } from "react";
import { getCategory } from "@/lib/content";
import { feeFor, makeRef, validateRegStep, type Errors, type RegistrationDraft } from "@/lib/validation";
import {
  DoneCard,
  Field,
  FormFooterNote,
  Honeypot,
  PaymentFields,
  SizePicker,
  StepBar,
  Summary,
  focusFirstError,
  postJson,
} from "./form-parts";
import { useLang } from "./lang";
import { CategoryPicker } from "./category-picker";
import { GiftIcon, useToast } from "./ui";
import { useDraft } from "./use-draft";

type State = RegistrationDraft & { step: number; done: boolean; demo: boolean; website: string };

const initial = (): State => ({
  ref: "",
  category: null,
  amount: "",
  name: "",
  department: "",
  session: "",
  studentId: "",
  email: "",
  size: "",
  method: "bkash",
  sender: "",
  trx: "",
  step: 1,
  done: false,
  demo: false,
  website: "",
});

export function RegisterFlow() {
  const { t, n, money } = useLang();
  const toast = useToast();
  const { state: s, setState, ready, restored, setRestored, clear } = useDraft<State>("irtika.registration.v1", initial);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const cat = getCategory(s.category);
  const total = feeFor(s.category, s.amount);
  const patch = (p: Partial<State>) => {
    setState((prev) => ({ ...prev, ...p }));
    // clear the error of any field being edited
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(p)) delete next[k];
      return next;
    });
  };
  const goTo = (step: number) => {
    setState((prev) => ({ ...prev, step, ref: prev.ref || (step === 4 ? makeRef("R") : "") }));
    setRestored(false);
    setBanner(null);
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    const e = validateRegStep(s.step, s);
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    goTo(s.step + 1);
  };

  const submit = async () => {
    if (busy) return;
    const e = validateRegStep(4, s);
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    setBusy(true);
    setBanner(null);
    const ref = s.ref || makeRef("R");
    const result = await postJson("/api/registrations", { ...s, ref });
    setBusy(false);
    if (result.kind === "ok") {
      // keep only the reference — personal details leave this device
      setState({ ...initial(), ref, done: true, demo: !!result.demo });
      window.scrollTo({ top: 0 });
    } else {
      setBanner(t(result.key));
      if (result.fields) setErrors(result.fields);
      focusFirstError();
    }
  };

  const startOver = () => {
    clear();
    setErrors({});
    setBanner(null);
    window.scrollTo({ top: 0 });
  };

  const stepLabels = [t("st1"), t("st2"), cat?.wear === "scarf" ? t("st3s") : t("st3"), t("st4")];

  return (
    <div className="gutter mx-auto max-w-5xl py-8 sm:py-12">
      <h1 className="font-display text-[clamp(1.9rem,5vw,2.8rem)] font-bold">{t("regH")}</h1>
      {!s.done && <p className="mt-1 text-muted">{t("regLead")}</p>}

      {!ready ? (
        <div className="panel mt-6 h-64 animate-pulse" aria-hidden />
      ) : s.done ? (
        <div className="mt-8">
          <DoneCard refCode={s.ref} message={t("doneP")} againLabel={t("newReg")} onAgain={startOver} demo={s.demo} />
        </div>
      ) : (
        <>
          <StepBar labels={stepLabels} current={s.step} />

          {restored && s.step > 1 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gold-soft px-4 py-3">
              <span>{t("restored")}</span>
              <button type="button" className="btn btn-ghost min-h-10" onClick={startOver}>{t("startOver")}</button>
            </div>
          )}

          <form
            className="panel relative"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (s.step < 4) next();
              else submit();
            }}
          >
            <Honeypot value={s.website} onChange={(v) => patch({ website: v })} />

            {s.step === 1 && (
              <div className="flex flex-col gap-3">
                <CategoryPicker
                  value={s.category}
                  amount={s.amount}
                  amountError={errors.amount}
                  onSelect={(id) => {
                    if (id === s.category) return;
                    const c = getCategory(id)!;
                    patch({
                      category: id,
                      amount: c.minimumOnly ? s.amount || String(c.fee) : "",
                      size: c.wear === "scarf" ? "" : s.size,
                    });
                  }}
                  onAmount={(amount) => patch({ amount })}
                />
                {errors.category && (
                  <p className="text-danger" aria-invalid="true" tabIndex={-1}>
                    {t(errors.category)}
                  </p>
                )}
              </div>
            )}

            {s.step === 2 && cat && (
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <Field id="name" label={t("fName")} value={s.name} onChange={(v) => patch({ name: v })} error={errors.name} autoComplete="name" className="sm:col-span-2" maxLength={100} />
                <Field id="department" label={t("fDept")} value={s.department} onChange={(v) => patch({ department: v })} error={errors.department} placeholder={t("phDept")} optional={!cat.studentInfo} maxLength={60} />
                <Field id="session" label={t("fSession")} value={s.session} onChange={(v) => patch({ session: v })} error={errors.session} placeholder={t("phSession")} optional={!cat.studentInfo} maxLength={20} />
                <Field id="studentId" label={t("fSid")} value={s.studentId} onChange={(v) => patch({ studentId: v })} error={errors.studentId} placeholder={t("phSid")} optional={!cat.studentInfo} maxLength={30} />
                <Field id="email" label={t("fEmail")} value={s.email} onChange={(v) => patch({ email: v.trim() })} error={errors.email} hint={t("emailHint")} type="email" inputMode="email" autoComplete="email" placeholder="name@gmail.com" maxLength={120} />
              </div>
            )}

            {s.step === 3 && cat && (
              cat.wear === "scarf" ? (
                <div className="flex flex-wrap items-center gap-5">
                  <span className="grid h-28 w-28 place-items-center rounded-2xl bg-gold-soft text-gold-ink">
                    <GiftIcon id="scarf" className="h-14 w-14" />
                  </span>
                  <div className="min-w-0 flex-1 basis-60">
                    <h2 className="font-display text-xl font-semibold">{t("scarfH")}</h2>
                    <p className="mt-1 text-muted">{t("scarfP")}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-xl font-semibold">{t("sizeH")}</h2>
                  <p className="text-muted">{t("sizeP")}</p>
                  <SizePicker value={s.size} onChange={(v) => patch({ size: v })} error={errors.size} />
                </div>
              )
            )}

            {s.step === 4 && cat && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <Summary
                    refCode={s.ref}
                    total={total}
                    rows={[
                      [t("st1"), t(`c_${cat.id}`)],
                      [t("fName"), s.name],
                      ...(s.studentId ? ([[t("fSid"), n(s.studentId)]] as [string, string][]) : []),
                      [t("fEmail"), s.email],
                      [cat.wear === "scarf" ? t("st3s") : t("size"), cat.wear === "scarf" ? t("g_scarf") : s.size],
                    ]}
                  />
                </div>
                <PaymentFields state={s} total={total} errors={errors} onChange={patch} />
              </div>
            )}

            {banner && (
              <p role="alert" className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-danger">
                {banner}
              </p>
            )}

            <div className="sticky bottom-[env(safe-area-inset-bottom)] z-10 -mx-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur sm:-mx-7 sm:px-7 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
              {s.step === 1 ? (
                <p className="min-w-0 text-sm" aria-live="polite">
                  {cat ? (
                    <>
                      <span className="text-muted">{t("selectedLabel")} </span>
                      <b>{t(`c_${cat.id}`)}</b>
                      <span className="mx-1.5 text-muted">·</span>
                      <b className="font-mono tabular-nums">{money(total)}</b>
                    </>
                  ) : (
                    <span className="text-muted">{t("pickCat")}</span>
                  )}
                </p>
              ) : s.step > 1 ? (
                <button type="button" className="btn btn-ghost min-w-32" onClick={() => goTo(s.step - 1)}>
                  ← {t("back")}
                </button>
              ) : null}
              <button type="submit" className="btn btn-primary min-w-40" disabled={busy || (s.step === 1 && !cat)}>
                {s.step < 4 ? `${t("next")} →` : busy ? t("submitting") : t("submit")}
              </button>
            </div>
          </form>

          <FormFooterNote
            onClear={() => {
              startOver();
              toast(t("cleared"));
            }}
          />
        </>
      )}
    </div>
  );
}
