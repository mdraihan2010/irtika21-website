# Irtika'21 — Official Website

Registration and gift-shop website for **Irtika'21**, organised by the Islamic Cultural Society, Jashore University of Science and Technology (JUST).

- **Date:** Monday, 23 November 2026, 4:15 PM (after Asr) to about 10 PM
- **Venue:** Central Playground, JUST

## Features

- Bilingual: Bangla and English (choice is remembered)
- Responsive: mobile, tablet, laptop, desktop
- 4-step registration without login: Category → Details → T-shirt / Gift → Payment
- Separate shop with quantities
- bKash / Nagad "Send Money" with Transaction ID
- Auto-save and draft recovery: details and scroll position survive refresh, closing the browser, or leaving for the payment app
- Server re-validates everything and recalculates prices; a Transaction ID can be used only once; double taps never create duplicates

## Project structure

```
irtika21-website/
├── prototype/            # first HTML prototype (reference only)
└── web/                  # the real website (Next.js + TypeScript + Tailwind)
    ├── app/              # pages: / , /register , /shop , and /api routes
    ├── components/       # UI pieces (header, forms, payment, language)
    ├── lib/
    │   ├── content.ts    # ← event facts, fees, gifts, prices, sizes, payment number
    │   ├── i18n.ts       # ← all Bangla and English text
    │   ├── validation.ts # rules shared by browser and server
    │   └── server/       # database access (server only)
    ├── public/images/    # logos and photos
    └── supabase/schema.sql
```

**To change a fee, price, number or text, edit `lib/content.ts` or `lib/i18n.ts` only.**

## Run locally

```bash
cd web
pnpm install
pnpm dev
```

Open http://localhost:3000. Without a database connected, submissions show a "development mode" note and are not saved.

## Connect the database (Supabase)

1. Create a free project at supabase.com.
2. SQL Editor → paste `web/supabase/schema.sql` → Run.
3. Copy `web/.env.example` to `web/.env.local` and fill in the URL and service-role key.
4. Restart `pnpm dev`.

Never commit `.env.local` or share the service-role key.

## Roadmap

- [x] Frontend prototype
- [x] Next.js site: home, registration, shop, payment, bilingual, auto-save
- [x] Submission API and database schema
- [ ] Admin dashboard (payment verification, search, export)
- [ ] Confirmation emails
- [ ] Deployment (Vercel)
