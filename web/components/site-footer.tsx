"use client";

import Image from "next/image";
import Link from "next/link";
import { EVENT } from "@/lib/content";
import { useLang } from "./lang";
import { useCopy } from "./ui";

export function SiteFooter() {
  const { t } = useLang();
  const copy = useCopy();
  const rows = [EVENT.contactEmail, EVENT.contactPhone];

  return (
    <footer id="contact" className="mt-auto border-t border-line bg-footer-bg text-footer-ink">
      <div className="gutter mx-auto grid max-w-6xl gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex gap-4">
          <Image src="/images/ics-logo.png" alt="Islamic Cultural Society, JUST" width={72} height={72} className="h-16 w-16 shrink-0" />
          <div>
            <p className="font-display text-xl text-footer-ink">{t("title")}</p>
            <p className="mt-1 max-w-[36ch] text-footer-muted">{t("footAbout")}</p>
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-footer-ink">{t("nContact")}</h2>
          <ul className="flex flex-col gap-2.5">
            {rows.map((v) => (
              <li key={v} className="flex flex-wrap items-center gap-2">
                <span className="select-all break-all text-footer-ink">{v}</span>
                <button type="button" onClick={() => copy(v)} className="rounded-full border border-line px-3 py-1 text-xs text-footer-ink hover:bg-sunk">
                  {t("copy")}
                </button>
              </li>
            ))}
            {EVENT.facebookUrl && (
              <li>
                <a href={EVENT.facebookUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-maroon-ink">
                  {t("facebook")}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-footer-ink">{t("links")}</h2>
          <ul className="flex flex-col gap-2">
            <li><Link href="/register" className="hover:text-maroon-ink">{t("register")}</Link></li>
            <li><Link href="/shop" className="hover:text-maroon-ink">{t("nShop")}</Link></li>
            <li><Link href="/#events" className="hover:text-maroon-ink">{t("nEvents")}</Link></li>
          </ul>
        </div>
        <p className="border-t border-line pt-5 text-sm text-footer-muted md:col-span-3">{t("footBase")}</p>
      </div>
    </footer>
  );
}
