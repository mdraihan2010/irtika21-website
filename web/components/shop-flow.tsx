"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_QTY, PRODUCTS, type PayMethod, type ProductId } from "@/lib/content";
import { cartCount, cartTotal, emptyCart, makeRef, validateOrder, type Cart, type Errors } from "@/lib/validation";
import { DoneCard, Field, FormFooterNote, Honeypot, PaymentFields, SizePicker, StepBar, Summary, focusFirstError, postJson } from "./form-parts";
import { useLang } from "./lang";
import { GiftVisual, useToast } from "./ui";
import { useDraft } from "./use-draft";
import type { TKey } from "@/lib/i18n";

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

/* ---------- অর্ডার মোডাল: পরিমাণ + সাইজ/মাপ ---------- */
function OrderModal({
  productId,
  cart,
  size,
  error,
  onQty,
  onSize,
  onClose,
}: {
  productId: ProductId | null;
  cart: Cart;
  size: string;
  error?: TKey;
  onQty: (id: ProductId, qty: number) => void;
  onSize: (v: string) => void;
  onClose: () => void;
}) {
  const { t, n, money } = useLang();
  const ref = useRef<HTMLDialogElement>(null);
  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (productId && !d.open) d.showModal();
    if (!productId && d.open) d.close();
  }, [productId]);

  if (!product) return <dialog ref={ref} onClose={onClose} />;

  const q = cart[product.id];
  const isTshirt = product.id === "tshirt";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="order-modal-title"
      className="m-auto w-[min(440px,calc(100vw-24px))] rounded-2xl bg-surface p-0 text-ink backdrop:bg-black/60"
    >
      <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-5">
        <div className="flex items-start gap-4">
          <div className="w-28 shrink-0">
            <GiftVisual id={product.id} sizes="112px" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="order-modal-title" className="font-display text-xl font-bold">{t(`g_${product.id}`)}</h3>
            <p className="mt-1 font-mono text-lg tabular-nums text-gold-ink">{money(product.price)}</p>
          </div>
        </div>

        {isTshirt && (
          <div className="flex flex-col gap-3">
            <p className="font-semibold">{t("tsize")}</p>
            <SizePicker value={size} onChange={onSize} error={error} showTable />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
          <span className="font-semibold">{t("qty")}</span>
          <div className="flex items-center rounded-full border-[1.5px] border-ink">
            <button
              type="button"
              className="h-11 w-12 text-xl"
              onClick={() => onQty(product.id, q - 1)}
              disabled={q <= 0}
              aria-label={t("qtyLess")}
            >
              −
            </button>
            <span className="min-w-10 text-center font-mono text-lg tabular-nums" aria-live="polite">{n(q)}</span>
            <button
              type="button"
              className="h-11 w-12 text-xl disabled:opacity-40"
              onClick={() => onQty(product.id, q + 1)}
              disabled={q >= MAX_QTY}
              aria-label={t("qtyMore")}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted">{t("total")}</span>
          <span className="font-mono text-lg font-semibold tabular-nums">{money(product.price * q)}</span>
        </div>

        <button type="button" className="btn btn-primary" onClick={onClose} autoFocus>
          {t("done")}
        </button>
      </div>
    </dialog>
  );
}

export function ShopFlow() {
  const { t, n, money } = useLang();
  const toast = useToast();
  const { state: s, setState, ready, clear } = useDraft<State>("irtika.order.v1", initial);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [modalFor, setModalFor] = useState<ProductId | null>(null);

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
  const setQty = (id: ProductId, qty: number) =>
    setState((prev) => ({
      ...prev,
      cart: { ...prev.cart, [id]: Math.max(0, Math.min(MAX_QTY, qty)) },
    }));

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
                      <div className="block">
                        <GiftVisual id={p.id} sizes="(min-width:1024px) 240px, 45vw" />
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-1">
                        <span className="font-semibold">{t(`g_${p.id}`)}</span>
                        <span className="font-mono tabular-nums text-gold-ink">{money(p.price)}</span>
                      </div>

                      <div className="mt-auto flex flex-col gap-2">
                        {q > 0 && (
                          <p className="px-1 text-sm text-muted">
                            {n(q)} × {money(p.price)} = <b className="font-mono text-ink">{money(p.price * q)}</b>
                          </p>
                        )}
                        {p.id === "tshirt" && q > 0 && s.size && (
                          <p className="px-1 text-sm">
                            {t("size")}: <b>{s.size}</b>
                          </p>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary w-full"
                          onClick={() => setModalFor(p.id)}
                        >
                          {t("orderNow")}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <OrderModal
                productId={modalFor}
                cart={s.cart}
                size={s.size}
                error={errors.size}
                onQty={setQty}
                onSize={(v) => patch({ size: v })}
                onClose={() => setModalFor(null)}
              />

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
                  {s.cart.tshirt > 0 && (
                    <p className="text-sm">
                      {t("tsize")}: <b>{s.size || "—"}</b>
                    </p>
                  )}
                  <Field id="name" label={t("fBuyer")} value={s.name} onChange={(v) => patch({ name: v })} error={errors.name} autoComplete="name" maxLength={100} />
                  <Field id="phone" label={t("fPhone")} value={s.phone} onChange={(v) => patch({ phone: v })} error={errors.phone} type="tel" inputMode="numeric" autoComplete="tel" placeholder="01XXXXXXXXX" maxLength={14} />
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
