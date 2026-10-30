// All event facts live here. Change a value once and every page updates.

export const EVENT = {
  /** Programme start: 23 Nov 2026, 4:15 PM Bangladesh time (after Asr) */
  startsAt: "2026-11-23T16:15:00+06:00",
  contactEmail: "icsocietyjust@gmail.com",
  contactPhone: "+8801935689238",
  /** Add the Facebook page link here when it is ready */
  facebookUrl: "" as string,
} as const;

/** Personal number: participants use "Send Money" and pay the charge themselves */
export const PAYMENT = {
  bkash: "01860307502",
  nagad: "01860307502",
} as const;

export type PayMethod = keyof typeof PAYMENT;
export const PAY_METHODS: PayMethod[] = ["bkash", "nagad"];

export type GiftId =
  | "tshirt"
  | "keyring"
  | "quran"
  | "giftpack"
  | "crest"
  | "uttoriyo"
  | "scarf";

/** `image` is shown when available; otherwise a drawn icon is used */
export const GIFTS: Record<GiftId, { image?: string }> = {
  tshirt: { image: "/images/gift-tshirt.png" },
  keyring: { image: "/images/gift-keyring.png" },
  quran: { image: "/images/gift-quran.png" },
  giftpack: { image: "/images/gift-giftpack.png" },
  crest: { image: "/images/gift-crest.png" },
  uttoriyo: { image: "/images/gift-uttoriyo.png" },
  scarf: { image: "/images/gift-scarf.png" },
};

export const GIFT_ORDER: GiftId[] = [
  "tshirt",
  "keyring",
  "quran",
  "giftpack",
  "crest",
  "uttoriyo",
  "scarf",
];

/** ছেলে বা মেয়ে */
export type Gender = "boy" | "girl";

/** ৮টি ক্যাটাগরি: ছেলে ও মেয়ে আলাদা। দাম একই। ছেলে টি-শার্ট, মেয়ে স্কার্ফ। */
export type CategoryId =
  | "fresher_b"
  | "general_b"
  | "grad_b"
  | "other_b"
  | "fresher_g"
  | "general_g"
  | "grad_g"
  | "other_g";

export type CategoryKind = "fresher" | "general" | "grad" | "other";

export type Category = {
  id: CategoryId;
  gender: Gender;
  kind: CategoryKind;
  fee: number;
  /** true when the participant may pay more than `fee` */
  minimumOnly?: boolean;
  gifts: GiftId[];
  wear: "tshirt" | "scarf";
  studentInfo: boolean;
};

export const CATEGORIES: Category[] = [
  // ছেলেদের বিভাগ
  { id: "fresher_b", gender: "boy", kind: "fresher", fee: 299, gifts: ["tshirt", "keyring", "quran", "giftpack"], wear: "tshirt", studentInfo: true },
  { id: "general_b", gender: "boy", kind: "general", fee: 299, gifts: ["tshirt", "keyring", "giftpack"], wear: "tshirt", studentInfo: true },
  { id: "grad_b", gender: "boy", kind: "grad", fee: 499, gifts: ["tshirt", "keyring", "quran", "giftpack", "crest", "uttoriyo"], wear: "tshirt", studentInfo: true },
  { id: "other_b", gender: "boy", kind: "other", fee: 499, minimumOnly: true, gifts: ["tshirt", "keyring", "giftpack"], wear: "tshirt", studentInfo: false },
  // মেয়েদের বিভাগ
  { id: "fresher_g", gender: "girl", kind: "fresher", fee: 299, gifts: ["scarf", "keyring", "quran", "giftpack"], wear: "scarf", studentInfo: true },
  { id: "general_g", gender: "girl", kind: "general", fee: 299, gifts: ["scarf", "keyring", "giftpack"], wear: "scarf", studentInfo: true },
  { id: "grad_g", gender: "girl", kind: "grad", fee: 499, gifts: ["scarf", "keyring", "quran", "giftpack", "crest", "uttoriyo"], wear: "scarf", studentInfo: true },
  { id: "other_g", gender: "girl", kind: "other", fee: 499, minimumOnly: true, gifts: ["scarf", "keyring", "giftpack"], wear: "scarf", studentInfo: false },
];

export const MAX_CUSTOM_AMOUNT = 100000;

export const getCategory = (id: string | null | undefined) =>
  CATEGORIES.find((c) => c.id === id);

export type ProductId = "tshirt" | "keyring" | "uttoriyo" | "scarf";
export const PRODUCTS: { id: ProductId; price: number }[] = [
  { id: "tshirt", price: 279 },
  { id: "keyring", price: 35 },
  { id: "uttoriyo", price: 100 },
  { id: "scarf", price: 279 },
];
export const MAX_QTY = 20;

/**
 * T-shirt sizes in inches: [size, length, chest].
 * Final chart (Standard Fit). SIZES_CONFIRMED is true because the chart is final.
 */
export const SIZES: [string, number, number][] = [
  ["S", 25, 36],
  ["M", 26, 38],
  ["L", 27, 40],
  ["XL", 28, 42],
  ["XXL", 29, 44],
  ["XXXL", 30, 46],
];
export const SIZES_CONFIRMED = true;
export const SIZE_IDS = SIZES.map((s) => s[0]);

export const SEGMENTS = [1, 2, 3, 4, 5, 6] as const;
/** Optional photo per segment (index = segment number) */
export const SEGMENT_IMAGES: Partial<Record<(typeof SEGMENTS)[number], string>> = {
  3: "/images/speaker.webp",
  4: "/images/sirah-360.jpg",
  6: "/images/azadi-manch.png",
};

export const GALLERY: { src: string; key: "gal1" | "gal2" | "gal3" | "gal4" | "gal5" | "gal6" | "gal7"; position?: string }[] = [
  { src: "/images/gallery-banner-handover.webp", key: "gal1" },
  { src: "/images/gallery-banner.webp", key: "gal2", position: "50% 22%" },
  { src: "/images/gallery-campus-team.webp", key: "gal3" },
  { src: "/images/gallery-office-team.webp", key: "gal4" },
  { src: "/images/speaker.webp", key: "gal6" },
  { src: "/images/azadi-manch.png", key: "gal7" },
];