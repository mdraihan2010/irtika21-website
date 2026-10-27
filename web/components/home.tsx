"use client";

import Image from "next/image";
import Link from "next/link";
import { GALLERY, GIFT_ORDER, SEGMENTS, SEGMENT_IMAGES } from "@/lib/content";
import { useState } from "react";
import { Countdown } from "./countdown";
import { Lightbox } from "./lightbox";
import { useLang } from "./lang";
import { GiftVisual, useGiftModal } from "./ui";

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Gallery />
      <Gifts />
      <Events />
    </>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden bg-night text-night-ink">
      {/* faint gold triangles echoing the logo's "২১" */}
      <div aria-hidden className="tri absolute -right-24 -top-10 h-80 w-[28rem] opacity-[.07]" />
      <div aria-hidden className="tri absolute -bottom-40 left-1/3 h-72 w-96 opacity-[.05]" />

      <div className="gutter relative mx-auto grid max-w-6xl items-center gap-10 py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:py-16">
        <div className="mx-auto w-full max-w-[260px] md:max-w-[340px]">
          <h1 className="sr-only">{t("title")}</h1>
          <Image
            src="/images/logo-full-dark.png"
            alt={`${t("title")} — ${t("tagline")}`}
            width={827}
            height={1079}
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <p className="eyebrow !text-gold">{t("org")}</p>
            <p className="mt-3 max-w-[54ch] text-lg text-paper-on-night/85">{t("heroLead")}</p>
          </div>

          <dl className="grid gap-3 rounded-2xl bg-white/[.04] p-4 ring-1 ring-white/10 sm:grid-cols-[auto_1fr] sm:gap-x-5">
            {(
              [
                ["date", "dateV"],
                ["time", "timeV"],
                ["venue", "venueV"],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-sm text-night-muted">{t(k)}</dt>
                <dd className="-mt-2 font-semibold text-paper-on-night sm:mt-0">{t(v)}</dd>
              </div>
            ))}
          </dl>

          <Countdown />

          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-gold">{t("registerNow")}</Link>
            <Link href="/#events" className="btn btn-night">{t("seeEvents")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mb-8 flex max-w-[62ch] flex-col gap-2">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-[clamp(1.7rem,4vw,2.4rem)] font-bold leading-tight">{title}</h2>
      {lead && <p className="text-muted">{lead}</p>}
    </div>
  );
}

function About() {
  const { t } = useLang();
  const facts = [
    ["f1h", "f1p"],
    ["f2h", "f2p"],
    ["f3h", "f3p"],
  ] as const;
  return (
    <section id="about" className="gutter mx-auto max-w-6xl py-16">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHead eyebrow={t("nAbout")} title={t("aboutH")} />
          <div className="flex max-w-[62ch] flex-col gap-4 text-[1.05rem]">
            <p>{t("aboutP1")}</p>
            <p>{t("aboutP2")}</p>
          </div>
        </div>
        <ul className="flex flex-col gap-3 self-end">
          {facts.map(([h, p]) => (
            <li key={h} className="flex gap-4 rounded-2xl bg-sunk p-4">
              <span aria-hidden className="tri mt-1.5 h-3 w-4 shrink-0" />
              <span>
                <b className="block font-semibold">{t(h)}</b>
                <span className="text-sm text-muted">{t(p)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Gallery() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const items = GALLERY.map((g) => ({ src: g.src, caption: t(g.key) }));
  return (
    <section id="gallery" className="border-y border-line bg-surface">
      <div className="gutter mx-auto max-w-6xl py-16">
        <SectionHead eyebrow={t("galE")} title={t("galH")} />
        <ul className="grid auto-rows-[160px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4">
          {GALLERY.map((g, i) => (
            <li key={g.src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${t(g.key)} — ${t("photoOpen")}`}
                className="group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-2xl bg-sunk text-left"
              >
                <Image
                  src={g.src}
                  alt={t(g.key)}
                  fill
                  sizes={i === 0 ? "(min-width:768px) 560px, 100vw" : "(min-width:768px) 280px, 50vw"}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  style={g.position ? { objectPosition: g.position } : undefined}
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 text-sm font-medium text-white">
                  {t(g.key)}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 opacity-80" aria-hidden>
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Lightbox items={items} index={open} onChange={setOpen} />
    </section>
  );
}

function Gifts() {
  const { t } = useLang();
  const openGift = useGiftModal();
  return (
    <section id="gifts" className="gutter mx-auto max-w-6xl py-16">
      <SectionHead eyebrow={t("nGifts")} title={t("giftH")} lead={t("giftP")} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {GIFT_ORDER.map((g) => (
          <li key={g}>
            <button
              type="button"
              onClick={() => openGift(g)}
              className="flex w-full flex-col gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition-colors hover:border-gold"
            >
              <GiftVisual id={g} sizes="(min-width:1024px) 270px, (min-width:640px) 30vw, 45vw" />
              <span className="px-1 pb-1 font-semibold">{t(`g_${g}`)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Events() {
  const { t, n } = useLang();
  return (
    <section id="events" className="border-t border-line bg-surface">
      <div className="gutter mx-auto max-w-6xl py-16">
        <SectionHead eyebrow={t("nEvents")} title={t("evH")} />
        <ol className="border-t border-line">
          {SEGMENTS.map((i) => {
            const img = SEGMENT_IMAGES[i];
            return (
              <li key={i} className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 border-b border-line py-6 sm:grid-cols-[72px_minmax(0,1fr)]">
                <span className="font-display text-3xl font-bold leading-none text-gold-ink sm:text-4xl">{n(i)}</span>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold sm:text-2xl">{t(`e${i}`)}</h3>
                    <p className="mt-1 max-w-[62ch] text-muted">{t(`e${i}p`)}</p>
                  </div>
                  {img && (
                    <div className="relative aspect-[3/2] w-full max-w-full shrink-0 overflow-hidden rounded-xl md:w-64">
                      <Image src={img} alt={t(`e${i}`)} fill sizes="(min-width:768px) 256px, 90vw" className="object-cover" />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-night p-6 text-night-ink sm:p-8">
          <div>
            <h3 className="font-display text-2xl font-bold text-paper-on-night">{t("ctaH")}</h3>
            <p className="mt-1 text-night-muted">{t("ctaP")}</p>
          </div>
          <Link href="/register" className="btn btn-gold">{t("registerNow")}</Link>
        </div>
      </div>
    </section>
  );
}
