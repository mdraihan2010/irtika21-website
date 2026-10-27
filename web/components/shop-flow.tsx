"use client";

import { useState } from "react";
import { MAX_QTY, PRODUCTS, type PayMethod, type ProductId } from "@/lib/content";
import { cartCount, cartTotal, emptyCart, makeRef, validateOrder, type Cart, type Errors } from "@/lib/validation";
import { DoneCard, Field, FormFooterNote, Honeypot, PaymentFields, SizePicker, StepBar, Summary, focusFirstError, postJson } from "./form-parts";
import { useLang } from "./lang";
import { GiftVisual, useGiftModal, useToast } from "./ui";
import { useDraft } from "./use-draft";

type State = {
  ref: string;
  step: 1 | 2;
  cart: Cart;
  name: string;
  phone: string;
  size: string;
  method: PayMethod;
  sender: string;
  trx: string;
  done: boolean;
  demo: boolean;
  website: string;
};

const initial = (): State => ({
  ref: "",
  step: 1,
  cart: emptyCart(),
  name: "",
  phone: "",
  size: "",
  method: "bkash",
  sender: "",
  trx: "",
  done: false,
  demo: false,
  website: "",
});

export function ShopFlow() {
  const { t, n, money } = useLang();
  const toast = useToast();
  const openGift = useGiftModal();
  const { state: s, setState, ready, clear } = useDraft<State>("irtika.order.v1", initial);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const count = cartCount(s.cart);
  const total = cartTotal(s.cart);

  const patch = (p: Partial<State>) => {
    setState((prev) => ({ ...prev, ...p }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(p)) delete next[k];
      return next;
    });
  };
  const setQty = (id: ProductId, delta: number) =>
    setState((prev) => ({ ...prev, cart: { ...prev.cart, [id]: Math.max(0, Math.min(MAX_QTY, prev.cart[id] + delta)) } }));

  const toStep = (step: 1 | 2) => {
    setState((prev) => ({ ...prev, step, ref: prev.ref || (step === 2 ? makeRef("S") : "") }));
    setBanner(null);
    window.scrollTo({ top: 0 });
  };

  const submit = async () => {
    if (busy) return;
    const e = validateOrder(s);
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    setBusy(true);
    setBanner(null);
    const ref = s.ref || makeRef("S");
    const result = await postJson("/api/orders", { ...s, ref });
    setBusy(false);
    if (result.kind === "ok") {
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

  return (
    <div className="gutter mx-auto max-w-5xl py-8 sm:py-12">
      <h1 className="font-display text-[clamp(1.9rem,5vw,2.8rem)] font-bold">{t("shopH")}</h1>
      {!s.done && <p className="mt-1 max-w-[60ch] text-muted">{t("shopP")}</p>}

      {!ready ? (
        <div className="panel mt-6 h-64 animate-pulse" aria-hidden />
      ) : s.done ? (
        <div className="mt-8">
          <DoneCard refCode={s.ref} message={t("doneShopP")} againLabel={t("newOrder")} onAgain={startOver} demo={s.demo} />
        </div>
      ) : (
        <>
          <StepBar labels={[t("shopSt1"), t("shopSt2")]} current={s.step} />

          {s.step === 1 && (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {PRODUCTS.map((p) => {
                  const q = s.cart[p.id];
                  return (
                    <li key={p.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
                      <button type="button" onClick={() => openGift(p.id)} className="block" aria-label={t(`g_${p.id}`)}>
                        <GiftVisual id={p.id} sizes="(min-width:1024px) 240px, 45vw" />
                      </button>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-1">
                        <span className="font-semibold">{t(`g_${p.id}`)}</span>
                        <span className="font-mono tabular-nums text-gold-ink">{money(p.price)}</span>
                      </div>
                      <div className="mt-auto">
                        {q === 0 ? (
                          <button type="button" className="btn btn-primary w-full" onClick={() => setQty(p.id, 1)}>
                            {t("orderNow")}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between rounded-full border-[1.5px] border-ink">
                            <button type="button" className="h-11 w-12 text-xl" onClick={() => setQty(p.id, -1)} aria-label={t("qtyLess")}>
                              −
                            </button>
                            <span className="font-mono text-lg tabular-nums" aria-live="polite">{n(q)}</span>
                            <button type="button" className="h-11 w-12 text-xl disabled:opacity-40" onClick={() => setQty(p.id, 1)} disabled={q >= MAX_QTY} aria-label={t("qtyMore")}>
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="sticky bottom-[calc(12px+env(safe-area-inset-bottom))] z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-4 shadow-lg backdrop-blur">
                <p className="font-semibold">
                  {count ? (
                    <>
                      {n(count)} {t("items")} · <span className="font-mono tabular-nums">{money(total)}</span>
                    </>
                  ) : (
                    <span className="font-normal text-muted">{t("cartEmpty")}</span>
                  )}
                </p>
                <button type="button" className="btn btn-primary" disabled={!count} onClick={() => toStep(2)}>
                  {t("checkout")} →
                </button>
              </div>
            </>
          )}

          {s.step === 2 && (
            <form
              className="panel relative"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <Honeypot value={s.website} onChange={(v) => patch({ website: v })} />
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="flex flex-col gap-5">
                  <Summary
                    refCode={s.ref}
                    total={total}
                    rows={PRODUCTS.filter((p) => s.cart[p.id] > 0).map((p) => [
                      `${t(`g_${p.id}`)} × ${n(s.cart[p.id])}`,
                      money(p.price * s.cart[p.id]),
                    ])}
                  />
                  <Field id="name" label={t("fBuyer")} value={s.name} onChange={(v) => patch({ name: v })} error={errors.name} autoComplete="name" maxLength={100} />
                  <Field id="phone" label={t("fPhone")} value={s.phone} onChange={(v) => patch({ phone: v })} error={errors.phone} type="tel" inputMode="numeric" autoComplete="tel" placeholder="01XXXXXXXXX" maxLength={14} />
                  {s.cart.tshirt > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold">{t("tsize")}</p>
                      <SizePicker value={s.size} onChange={(v) => patch({ size: v })} error={errors.size} showTable={false} />
                    </div>
                  )}
                </div>
                <PaymentFields state={s} total={total} errors={errors} onChange={patch} />
              </div>

              {banner && (
                <p role="alert" className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-danger">
                  {banner}
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <button type="button" className="btn btn-ghost min-w-32" onClick={() => toStep(1)}>
                  ← {t("back")}
                </button>
                <button type="submit" className="btn btn-primary min-w-40" disabled={busy}>
                  {busy ? t("submitting") : t("submit")}
                </button>
              </div>
            </form>
          )}

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
