// Shared by the browser (instant feedback) and the API (final check).
// The server never trusts the browser: it runs these again and recalculates prices.

import {
  CATEGORIES,
  MAX_CUSTOM_AMOUNT,
  MAX_QTY,
  PAY_METHODS,
  PRODUCTS,
  SIZE_IDS,
  getCategory,
  type CategoryId,
  type PayMethod,
  type ProductId,
} from "./content";
import type { TKey } from "./i18n";

export type Errors = Partial<Record<string, TKey>>;

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** "+880 1712-345678" → "01712345678"; returns "" when invalid */
export function normalizeBdPhone(raw: string) {
  const digits = raw.replace(/[\s-]/g, "").replace(/^\+?88/, "");
  return /^01[3-9]\d{8}$/.test(digits) ? digits : "";
}

export const normalizeTrx = (raw: string) => raw.replace(/\s/g, "").toUpperCase();
export const isValidTrx = (trx: string) => /^[A-Z0-9]{8,12}$/.test(trx);
export const isGmail = (email: string) => /^[a-z0-9._%+-]+@gmail\.com$/i.test(email);

/* ---------------- Registration ---------------- */

export type RegistrationDraft = {
  ref: string;
  category: CategoryId | null;
  amount: string;
  name: string;
  department: string;
  session: string;
  studentId: string;
  designation: string;
  email: string;
  whatsapp: string;
  size: string;
  method: PayMethod;
  sender: string;
  trx: string;
};

export function feeFor(category: CategoryId | null, amount: string | number) {
  const c = getCategory(category);
  if (!c) return 0;
  if (!c.minimumOnly) return c.fee;
  const n = Math.floor(Number(amount));
  return Number.isFinite(n) && n >= c.fee ? Math.min(n, MAX_CUSTOM_AMOUNT) : c.fee;
}

export function validateRegStep(step: number, d: RegistrationDraft): Errors {
  const e: Errors = {};
  const c = getCategory(d.category);
  if (step >= 1) {
    if (!c) e.category = "e_category";
    else if (c.minimumOnly) {
      const n = Number(d.amount);
      if (!Number.isFinite(n) || n < c.fee || n > MAX_CUSTOM_AMOUNT) e.amount = "e_amount";
    }
  }
  if (step >= 2 && c) {
    if (d.name.trim().length < 2) e.name = "e_name";
    if (c.studentInfo) {
      if (!d.department.trim()) e.department = "e_required";
      if (!d.session.trim()) e.session = "e_required";
      if (!d.studentId.trim()) e.studentId = "e_required";
    } else if (d.designation.trim().length < 2) {
      e.designation = "e_designation";
    }
    if (!isGmail(d.email.trim())) e.email = "e_email";
    if (!normalizeBdPhone(d.whatsapp)) e.whatsapp = "e_whatsapp";
  }
  if (step >= 3 && c && c.wear === "tshirt" && !SIZE_IDS.includes(d.size)) e.size = "e_size";
  if (step >= 4) {
    if (!normalizeBdPhone(d.sender)) e.sender = "e_phone";
    if (!isValidTrx(normalizeTrx(d.trx))) e.trx = "e_trx";
  }
  return e;
}

/** Server-side: turn untrusted JSON into a clean record, or return errors */
export function parseRegistration(body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const method = PAY_METHODS.includes(b.method as PayMethod) ? (b.method as PayMethod) : "bkash";
  const draft: RegistrationDraft = {
    ref: str(b.ref, 32),
    category: CATEGORIES.some((c) => c.id === b.category) ? (b.category as CategoryId) : null,
    amount: String(b.amount ?? ""),
    name: str(b.name, 100),
    department: str(b.department, 60),
    session: str(b.session, 20),
    studentId: str(b.studentId, 30),
    designation: str(b.designation, 80),
    email: str(b.email, 120).toLowerCase(),
    whatsapp: str(b.whatsapp, 20),
    size: str(b.size, 5),
    method,
    sender: str(b.sender, 20),
    trx: normalizeTrx(str(b.trx, 20)),
  };
  const errors = validateRegStep(4, draft);
  if (!/^IRT-R[A-Z0-9]{8}$/.test(draft.ref)) errors.ref = "e_server";
  if (Object.keys(errors).length) return { ok: false as const, errors };
  const c = getCategory(draft.category)!;
  return {
    ok: true as const,
    record: {
      ref: draft.ref,
      category: c.id,
      gender: c.gender,
      kind: c.kind,
      amount: feeFor(c.id, draft.amount),
      name: draft.name,
      department: c.studentInfo ? draft.department : null,
      session: c.studentInfo ? draft.session : null,
      student_id: c.studentInfo ? draft.studentId : null,
      designation: c.studentInfo ? null : draft.designation,
      email: draft.email,
      whatsapp: normalizeBdPhone(draft.whatsapp),
      gift_wear: c.wear,
      tshirt_size: c.wear === "tshirt" ? draft.size : null,
      pay_method: draft.method,
      sender_number: normalizeBdPhone(draft.sender),
      trx_id: draft.trx,
    },
  };
}

/* ---------------- Shop order ---------------- */

export type Cart = Record<ProductId, number>;
export const emptyCart = (): Cart => ({ tshirt: 0, keyring: 0, uttoriyo: 0, scarf: 0 });

export const cartCount = (cart: Cart) => PRODUCTS.reduce((n, p) => n + (cart[p.id] || 0), 0);
export const cartTotal = (cart: Cart) => PRODUCTS.reduce((n, p) => n + p.price * (cart[p.id] || 0), 0);

export type OrderDraft = {
  ref: string;
  cart: Cart;
  name: string;
  phone: string;
  size: string;
  method: PayMethod;
  sender: string;
  trx: string;
};

export function validateOrder(d: OrderDraft): Errors {
  const e: Errors = {};
  if (cartCount(d.cart) < 1) e.cart = "e_cart";
  if (d.name.trim().length < 2) e.name = "e_name";
  if (!normalizeBdPhone(d.phone)) e.phone = "e_phone";
  if (d.cart.tshirt > 0 && !SIZE_IDS.includes(d.size)) e.size = "e_size";
  if (!normalizeBdPhone(d.sender)) e.sender = "e_phone";
  if (!isValidTrx(normalizeTrx(d.trx))) e.trx = "e_trx";
  return e;
}

export function parseOrder(body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const rawCart = (b.cart ?? {}) as Record<string, unknown>;
  const cart = emptyCart();
  for (const p of PRODUCTS) {
    const q = Math.floor(Number(rawCart[p.id] ?? 0));
    cart[p.id] = Number.isFinite(q) ? Math.max(0, Math.min(MAX_QTY, q)) : 0;
  }
  const draft: OrderDraft = {
    ref: str(b.ref, 32),
    cart,
    name: str(b.name, 100),
    phone: str(b.phone, 20),
    size: str(b.size, 5),
    method: PAY_METHODS.includes(b.method as PayMethod) ? (b.method as PayMethod) : "bkash",
    sender: str(b.sender, 20),
    trx: normalizeTrx(str(b.trx, 20)),
  };
  const errors = validateOrder(draft);
  if (!/^IRT-S[A-Z0-9]{8}$/.test(draft.ref)) errors.ref = "e_server";
  if (Object.keys(errors).length) return { ok: false as const, errors };
  const items = PRODUCTS.filter((p) => cart[p.id] > 0).map((p) => ({
    product: p.id,
    qty: cart[p.id],
    unit_price: p.price,
  }));
  return {
    ok: true as const,
    record: {
      ref: draft.ref,
      buyer_name: draft.name,
      phone: normalizeBdPhone(draft.phone),
      items,
      tshirt_size: cart.tshirt > 0 ? draft.size : null,
      total: cartTotal(cart),
      pay_method: draft.method,
      sender_number: normalizeBdPhone(draft.sender),
      trx_id: draft.trx,
    },
  };
}

/** Unguessable reference like IRT-R7K2M9QXA */
export function makeRef(kind: "R" | "S") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `IRT-${kind}${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}
