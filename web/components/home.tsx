"use client";

import Image from "next/image";
import Link from "next/link";
import { GALLERY, GIFT_ORDER, SEGMENTS, SEGMENT_IMAGES } from "@/lib/content";
import { useEffect, useState, type MouseEvent } from "react";
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
  const [mounted, setMounted] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleMove(e: MouseEvent<HTMLElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
      active: true,
    });
  }

  function handleLeave() {
    setPointer((p) => ({ ...p, active: false }));
  }

  const rows = [
    ["date", "dateV"],
    ["time", "timeV"],
    ["venue", "venueV"],
  ] as const;

  const logoAlt = `${t("title")} — ${t("tagline")}`;

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative overflow-hidden bg-maroon-soft text-ink"
    >
      {/* মাউসের সাথে চলমান আলো */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${(pointer.x + 0.5) * 100}% ${(pointer.y + 0.5) * 100}%, rgba(128,0,32,0.10), transparent 60%)`,
          opacity: pointer.active ? 1 : 0,
        }}
      />

      {/* faint triangles echoing the logo's "২১" */}
      <div
        aria-hidden
        className="tri absolute -right-24 -top-10 h-80 w-[28rem] opacity-[.10]"
        style={{
          transform: `translate(${pointer.x * -40}px, ${pointer.y * -40}px)`,
          transition: "transform .6s ease-out",
        }}
      />
      <div
        aria-hidden
        className="tri absolute -bottom-40 left-1/3 h-72 w-96 opacity-[.07]"
        style={{
          transform: `translate(${pointer.x * 30}px, ${pointer.y * 30}px)`,
          transition: "transform .6s ease-out",
        }}
      />

      <div className="gutter relative mx-auto grid max-w-6xl items-center gap-10 py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:py-16">
        {/* লোগো: লাইট মোডে সাদা-পটভূমির লোগো, ডার্ক মোডে কালো-পটভূমির লোগো */}
        <div
          className={`mx-auto w-full max-w-[260px] transition-all duration-1000 ease-out md:max-w-[340px] ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div
            style={{
              transform: `perspective(900px) rotateY(${pointer.x * 12}deg) rotateX(${pointer.y * -12}deg)`,
              transition: "transform .4s ease-out",
            }}
          >
            <h1 className="sr-only">{t("title")}</h1>
            <Image
              src="/images/logo-full.png"
              alt={logoAlt}
              width={827}
              height={1079}
              priority
              className="logo-light h-auto w-full"
            />
            <Image
              src="/images/logo-full-dark.png"
              alt={logoAlt}
              width={827}
              height={1079}
              priority
              className="logo-dark h-auto w-full"
            />
          </div>
        </div>

        {/* লেখা ও তথ্য: একটি হালকা কার্ডের ভেতরে, যাতে পটভূমি থেকে আলাদা দেখায় */}
        <div className="flex min-w-0 flex-col gap-6 rounded-3xl bg-surface p-6 shadow-[0_18px_40px_-20px_rgba(128,0,32,0.35)] ring-1 ring-maroon/15 sm:p-8">
          <div
            className={`transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <p className="eyebrow">{t("org")}</p>
           <div className="font-display mt-3 max-w-[54ch] text-xl font-bold leading-snug text-ink sm:text-2xl">
  {t("heroLead").split("|").map((line, i) => (
    <span key={i} className="block">{line}</span>
  ))}
</div>
          </div>

          <dl className="grid gap-2 rounded-2xl border border-line bg-paper p-4">
            {rows.map(([k, v], idx) => (
              <div
                key={k}
                className={`group grid gap-1 rounded-lg px-2 py-1.5 transition-all duration-500 hover:bg-sunk sm:grid-cols-[auto_1fr] sm:gap-x-5 ${
                  mounted ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: `${300 + idx * 150}ms` }}
              >
                <dt className="text-sm text-muted">{t(k)}</dt>
                <dd className="font-display font-semibold text-ink transition-colors duration-300 group-hover:text-maroon-ink">
                  {t(v)}
                </dd>
              </div>
            ))}
          </dl>

          <div
            className={`transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "700ms" }}
          >
            <Countdown />
          </div>
        </div>
      </div>

      {/* নিচে স্ক্রল করার তীর */}
      <a
        href="#about"
        aria-label="পরের সেকশনে যান"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-muted transition-colors hover:text-maroon-ink"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
          className="animate-bounce"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
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

/** লেখার ভেতরে {{...}} থাকলে সেই অংশ আলাদা ফন্টে (Kalpurush) দেখাবে */
function Accented({ text }: { text: string }) {
  const parts = text.split(/\{\{(.+?)\}\}/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="bn-num-kalpurush">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function About() {
  const { t } = useLang();
  return (
    <section id="about" className="gutter mx-auto max-w-4xl py-16">
      <div className="mb-8 flex max-w-[62ch] flex-col gap-2">
        <p className="eyebrow">{t("nAbout")}</p>
        <h2 className="font-display text-[clamp(1.7rem,4vw,2.4rem)] font-bold leading-tight">
          ইর্তিকা’<span className="bn-num-kalpurush">২১</span> কী?
        </h2>
      </div>

      <div className="font-sans flex flex-col gap-5 text-lg leading-loose text-ink sm:text-xl">
        <p className="font-display text-2xl font-bold text-maroon-ink">{t("aboutIntro")}</p>
        <p>{t("aboutP1")}</p>
        <p>{t("aboutP2")}</p>
        <p><Accented text={t("aboutP3")} /></p>
        <p className="font-display border-l-4 border-maroon pl-4 text-xl font-semibold text-maroon-ink">
          {t("aboutP4")}
        </p>
      </div>
    </section>
  );
}
function Gallery() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const items = GALLERY.map((g) => ({ src: g.src, caption: t(g.key) }));
  const count = GALLERY.length;

  // প্রতি ২.৫ সেকেন্ডে এক ধাপ বামে (anticlockwise) সরবে
  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), 1500);
    return () => clearInterval(id);
  }, [paused, count]);

  const pos = (i: number) => {
    // প্রতিটি ছবির অবস্থান: 0 = মাঝে, -1 = বাম, 1 = ডান
    const diff = (i - active + count) % count;
    if (diff === 0) return "center";
    if (diff === 1) return "right";
    if (diff === count - 1) return "left";
    return "hidden";
  };

  return (
    <section id="gallery" className="border-y border-line bg-surface">
      <div className="gutter mx-auto max-w-6xl py-16">
        <SectionHead eyebrow={t("galE")} title={t("galH")} />

        <div
          className="relative mx-auto flex h-[260px] w-full items-center justify-center overflow-hidden sm:h-[360px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {GALLERY.map((g, i) => {
            const p = pos(i);
            const base =
              "absolute overflow-hidden rounded-2xl bg-sunk transition-all duration-400 ease-in-out";
            const cls =
              p === "center"
                ? "z-20 left-1/2 top-0 h-full w-[62%] -translate-x-1/2 shadow-xl"
                : p === "left"
                ? "z-10 left-0 top-1/2 h-[64%] w-[22%] -translate-y-1/2 opacity-80"
                : p === "right"
                ? "z-10 right-0 top-1/2 h-[64%] w-[22%] -translate-y-1/2 opacity-80"
                : "pointer-events-none opacity-0";
            return (
              <button
                key={g.src}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${t(g.key)} — ${t("photoOpen")}`}
                className={`${base} ${cls} cursor-zoom-in text-left`}
                tabIndex={p === "center" ? 0 : -1}
              >
                <Image
                  src={g.src}
                  alt={t(g.key)}
                  fill
                  sizes="(min-width:768px) 560px, 80vw"
                  className="object-cover"
                  style={g.position ? { objectPosition: g.position } : undefined}
                />
                {p === "center" && (
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 text-base font-medium text-white">
                    {t(g.key)}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 opacity-80" aria-hidden>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* নিচে ছোট সূচক বিন্দু */}
        <div className="mt-5 flex justify-center gap-2" aria-hidden>
          {GALLERY.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === active ? "w-6 bg-maroon" : "w-2 bg-line"
              }`}
            />
          ))}
        </div>
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
              className="flex w-full flex-col gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition-colors hover:border-maroon"
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
  const [active, setActive] = useState<number | null>(SEGMENTS[0] ?? null);

  return (
    <section id="events" className="border-t border-line bg-surface">
      <div className="gutter mx-auto max-w-6xl py-16">
        <SectionHead eyebrow={t("nEvents")} title={t("evH")} />

        <ol className="border-t border-line">
          {SEGMENTS.map((i) => {
            const img = SEGMENT_IMAGES[i];
            const isOpen = active === i;
            const panelId = `segment-panel-${i}`;

            return (
              <li key={i} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setActive(isOpen ? null : i)}
                  className="group grid w-full cursor-pointer grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 py-6 text-left sm:grid-cols-[72px_minmax(0,1fr)_auto]"
                >
                  <span
                    className={`font-display text-3xl font-bold leading-none transition-all duration-300 sm:text-4xl ${
                      isOpen ? "scale-110 text-maroon" : "text-maroon-ink group-hover:scale-110"
                    }`}
                  >
                    {n(i)}
                  </span>

                  <h3
                    className={`font-display text-xl font-semibold transition-colors duration-300 sm:text-2xl ${
                      isOpen ? "text-maroon-ink" : "group-hover:text-maroon-ink"
                    }`}
                  >
                    {t(`e${i}`)}
                  </h3>

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                    className={`shrink-0 text-muted transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-maroon-ink" : "group-hover:text-maroon-ink"
                    }`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div
                  id={panelId}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-4 pb-6 pl-[48px] sm:pl-[72px] md:flex-row md:items-start md:justify-between md:gap-8">
                      <p className="max-w-[62ch] text-muted"><Accented text={t(`e${i}p`)} /></p>
                      {img && (
                        <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl md:w-64">
                          <Image
                            src={img}
                            alt={t(`e${i}`)}
                            fill
                            sizes="(min-width:768px) 256px, 90vw"
                            className={`object-cover transition-transform duration-700 ${
                              isOpen ? "scale-100" : "scale-105"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-maroon-soft p-6 ring-1 ring-maroon/15 sm:p-8">
          <div>
            <h3 className="font-display text-2xl font-bold text-ink">{t("ctaH")}</h3>
            <p className="mt-1 text-muted">{t("ctaP")}</p>
          </div>
          <Link href="/register" className="btn btn-primary">{t("registerNow")}</Link>
        </div>
      </div>
    </section>
  );
}
