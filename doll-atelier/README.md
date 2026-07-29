# Crochi by Queen — doll store + gated workshop videos

A working starter for: selling crochet dolls with order tracking, plus a
paid "workshop videos" section that only unlocks after payment and can't be
downloaded.

## Running it locally

```bash
npm install
cp .env.example .env          # already done for you, but if you ever reset it
npx prisma db push            # creates dev.db (SQLite) from the schema
npm run seed                  # creates the owner login (see below)
npm run dev
```

Then open http://localhost:3000

- **Customer side:** register at `/register`, browse dolls, buy one, watch the
  tracking page fill in at `/account`. Unlock a workshop video at `/learn`.
- **Owner side:** log in at `/admin/login` with the account the seed script
  printed to your terminal (default: `owner@handandthread.test` /
  `workshop123` — change this before it's ever public). Add doll listings
  and workshop videos, and update order status as you dispatch/deliver.

## How the pieces fit together

- **Auth:** one `User` table with a `role` (`CUSTOMER` or `OWNER`). Same
  login form works for both — `/admin/login` is just a separate front door
  that also checks the role is `OWNER`.
- **Order tracking:** every order has a `status` plus a full `OrderStatusEvent`
  history, so the tracking page always reflects what the owner last set from
  the dashboard. No courier API needed unless you want live GPS-style
  tracking later — this is the same model Etsy/Amazon-style tracking pages
  use under the hood.
- **Video protection:** this is the part you specifically asked about, so a
  bit more detail:
  1. The video *file* lives in `/private-videos`, a folder that's never
     served publicly (unlike `/public`).
  2. A customer only ever gets a *signed, 10-minute link* to the video,
     generated in `lib/video.js`, and only after your server confirms a
     `VideoAccess` row exists for that user + video (i.e., they paid).
  3. The `<video>` tag uses `controlsList="nodownload"` and blocks
     right-click, which stops the casual "save video as" — nothing (not even
     Netflix) can fully stop screen recording, but this stops link-sharing
     and one-click downloading, which is what you asked for.
  4. No download button exists anywhere in the UI, by design.

## Before you take real payments or go live

This starter **simulates** successful payments so you can build and test the
whole flow without a payment account. Two files are the ones to change:

- `app/api/orders/route.js` — physical doll checkout
- `app/api/videos/[id]/purchase/route.js` — video unlock

In both, add a Razorpay payment step before the order/access record is
created (Razorpay is the standard choice for Indian UPI/card/netbanking
payments). The comment in each file marks exactly where.

For video hosting at real scale, `/private-videos` on your own server works
fine for a small catalog like yours, but for anything bigger, switch to
**Cloudflare Stream** — upload once, get back signed playback URLs the same
way this app already does. The one file to change is `lib/video.js`; nothing
else in the app needs to know the difference.

## Going from SQLite to a real database

SQLite (`dev.db`) is fine for building and even for a small early store. When
you're ready to deploy (Vercel + a hosted Postgres like Neon or Supabase is
the easiest combo), change `provider = "sqlite"` to `provider = "postgresql"`
in `prisma/schema.prisma`, point `DATABASE_URL` at your new database, and run
`npx prisma db push` again. No other code changes needed.

## Folder structure

```
app/                — pages and API routes (Next.js App Router)
  admin/            — owner dashboard (products, videos, orders)
  account/          — customer's order tracking
  learn/            — workshop videos catalog + protected player
  products/[id]/    — doll detail + buy page
  api/              — all backend routes
components/         — shared UI (header, product card, tracking timeline)
lib/                — auth, sessions, video signing, database client
prisma/schema.prisma — the entire data model, in one readable file
private-videos/     — uploaded video files (never served directly)
public/uploads/     — uploaded photos/thumbnails (fine to serve directly)
```
