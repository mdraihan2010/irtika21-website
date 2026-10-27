// All event facts live here. Change a value once and every page updates.

export const EVENT = {
  /** Programme start: 23 Nov 2026, 4:15 PM Bangladesh time (after Asr) */
  startsAt: "2026-11-23T16:15:00+06:00",
  contactEmail: "icsocietyjust@gmail.com",
  contactPhone: "+8801935689238",
  /** Add the Facebook page link here when it is ready */
  facebookUrl: "" as string,
} as const;

/** Personal number — participants use "Send Money" and pay the charge themselves */
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
  tshirt: {},
  keyring: { image: "/images/gift-keyring.webp" },
  quran: { image: "/images/gift-quran.webp" },
  giftpack: { image: "/images/gift-giftpack.webp" },
  crest: { image: "/images/gift-crest.webp" },
  uttoriyo: { image: "/images/gift-uttoriyo.webp" },
  scarf: {},
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

export type CategoryId = "fresher" | "general" | "gradM" | "gradF" | "other";

export type Category = {
  id: CategoryId;
  fee: number;
  /** true when the participant may pay more than `fee` */
  minimumOnly?: boolean;
  gifts: GiftId[];
  /** what the participant wears: a sized T-shirt or a scarf */
  wear: "tshirt" | "scarf";
  /** student fields required? */
  studentInfo: boolean;
};

export const CATEGORIES: Category[] = [
  { id: "fresher", fee: 249, gifts: ["tshirt", "keyring", "quran", "giftpack"], wear: "tshirt", studentInfo: true },
  { id: "general", fee: 299, gifts: ["tshirt", "giftpack"], wear: "tshirt", studentInfo: true },
  { id: "gradM", fee: 499, gifts: ["tshirt", "keyring", "quran", "giftpack", "crest", "uttoriyo"], wear: "tshirt", studentInfo: true },
  { id: "gradF", fee: 499, gifts: ["scarf", "keyring", "quran", "giftpack"], wear: "scarf", studentInfo: true },
  { id: "other", fee: 349, minimumOnly: true, gifts: ["tshirt"], wear: "tshirt", studentInfo: false },
];

export const MAX_CUSTOM_AMOUNT = 100000;

export const getCategory = (id: string | null | undefined) =>
  CATEGORIES.find((c) => c.id === id);

export type ProductId = "tshirt" | "keyring" | "uttoriyo" | "scarf";
export const PRODUCTS: { id: ProductId; price: number }[] = [
  { id: "tshirt", price: 249 },
  { id: "keyring", price: 35 },
  { id: "uttoriyo", price: 100 },
  { id: "scarf", price: 499 },
];
export const MAX_QTY = 20;

/**
 * T-shirt sizes in inches: [size, length, chest].
 * SAMPLE values — set SIZES_CONFIRMED to true after entering the final chart.
 */
export const SIZES: [string, number, number][] = [
  ["S", 26, 36],
  ["M", 27, 38],
  ["L", 28, 40],
  ["XL", 29, 42],
  ["XXL", 30, 44],
];
export const SIZES_CONFIRMED = false;
export const SIZE_IDS = SIZES.map((s) => s[0]);

export const SEGMENTS = [1, 2, 3, 4, 5] as const;
/** Optional photo per segment (index = segment number) */
export const SEGMENT_IMAGES: Partial<Record<(typeof SEGMENTS)[number], string>> = {
  3: "/images/speaker.webp",
};

export const GALLERY: { src: string; key: "gal1" | "gal2" | "gal3" | "gal4" | "gal5"; position?: string }[] = [
  { src: "/images/gallery-banner-handover.webp", key: "gal1" },
  { src: "/images/gallery-banner.webp", key: "gal2", position: "50% 22%" },
  { src: "/images/gallery-campus-team.webp", key: "gal3" },
  { src: "/images/gallery-office-team.webp", key: "gal4" },
  { src: "/images/speaker.webp", key: "gal5" },
];
