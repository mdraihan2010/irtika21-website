import type { Metadata, Viewport } from "next";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "@fontsource/anek-bangla/600.css";
import "@fontsource/anek-bangla/700.css";
import "./globals.css";
import { LangProvider } from "@/components/lang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { THEME_INIT_SCRIPT } from "@/components/theme-toggle";
import { GiftModalProvider, ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ইর্তিকা’২১ · Irtika’21",
    template: "%s · ইর্তিকা’২১",
  },
  description:
    "ইসলামিক কালচারাল সোসাইটি, যবিপ্রবি আয়োজিত ইর্তিকা’২১ — নবীনবরণ, বিদায়ী সম্মাননা, গাইডেন্স সিম্পোজিয়াম। ২৩ নভেম্বর ২০২৬, কেন্দ্রীয় খেলার মাঠ। অনলাইনে রেজিস্ট্রেশন করুন।",
  openGraph: {
    title: "ইর্তিকা’২১ · Irtika’21",
    description: "উৎকর্ষের সোপানে, স্বপ্নের দিগন্তে — ২৩ নভেম্বর ২০২৬, যবিপ্রবি",
    images: ["/images/logo-full.png"],
    locale: "bn_BD",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#181816" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <LangProvider>
          <ToastProvider>
            <GiftModalProvider>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </GiftModalProvider>
          </ToastProvider>
        </LangProvider>
      </body>
    </html>
  );
}
