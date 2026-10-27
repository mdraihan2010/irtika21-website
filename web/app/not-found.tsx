"use client";

import Link from "next/link";
import { useLang } from "@/components/lang";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="gutter mx-auto flex max-w-xl flex-col items-center gap-4 py-24 text-center">
      <span aria-hidden className="tri h-10 w-14" />
      <h1 className="font-display text-3xl font-bold">404</h1>
      <p className="text-muted">{t("e_notFound")}</p>
      <Link href="/" className="btn btn-primary">{t("backHome")}</Link>
    </div>
  );
}
