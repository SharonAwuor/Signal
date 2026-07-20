# Signal — scam verification app

A full Next.js app: real database, real auth, real Stripe payments, and
fuzzy/partial matching instead of exact-string-only lookups.

## What changed from the artifact prototype

| | Prototype (artifact) | This project |
|---|---|---|
| Data | In-memory / artifact key-value storage | Prisma + SQLite (swap to Postgres for prod) |
| Auth | Mock, plaintext, per-browser | bcrypt password hashing, JWT in an httpOnly cookie |
| Matching | Exact string match only | Exact match **+ fuzzy/partial match** (typos, missing digits, near-miss handles) |
| Payments | A button that flips a flag | Real Stripe Checkout + subscriptions + webhook |
| Access tiers | Enforced in the UI only | Enforced **server-side** in the API — a free user can't get premium data by inspecting network requests |

## 1. Install

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in `JWT_SECRET` (any random string — `openssl rand -base64 32` works).
Leave the Stripe values as placeholders for now if you just want to run it locally first.

## 2. Set up the database

SQLite is the default — zero setup, a file on disk:

```bash
npm run db:push   # creates dev.db from prisma/schema.prisma
npm run seed       # adds sample scam reports + a demo login
```

Demo login after seeding: `demo@signal.app` / `password123` (already premium).

**For production**, switch to Postgres:
1. Get a connection string from [Supabase](https://supabase.com), [Neon](https://neon.tech), or Vercel Postgres.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Put the connection string in `DATABASE_URL`.
4. Run `npm run db:push` again.

## 3. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 4. Wire up real payments (Stripe)

1. Create a [Stripe](https://dashboard.stripe.com) account (test mode is fine to start).
2. **Product & price**: Dashboard → Product catalog → add a product ("Signal Premium"), add a recurring price. Copy the price ID (`price_...`) into `STRIPE_PRICE_ID`.
3. **API keys**: Dashboard → Developers → API keys. Copy the secret key into `STRIPE_SECRET_KEY` and the publishable key into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. **Webhook (local dev)**: install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   It prints a `whsec_...` value — put that in `STRIPE_WEBHOOK_SECRET`.
5. **Webhook (production)**: Dashboard → Developers → Webhooks → add endpoint → `https://yourdomain.com/api/stripe/webhook`, subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET` on your host.
6. Click "Go Premium" in the app — it opens a real Stripe Checkout page. On success, the webhook flips `user.premium = true` in the database. Cancelling or a failed renewal flips it back automatically.

Test-mode card: `4242 4242 4242 4242`, any future date, any CVC.

## How matching works (`lib/match.ts`)

- **Phone numbers**: digits are compared on the last 9 digits (tolerates country-code formatting differences like `0712...` vs `+254712...`), then edit distance catches near-miss typos and returns a similarity score.
- **Names, businesses, handles**: exact normalized match first; everything else is scored with [Fuse.js](https://fusejs.io) fuzzy search, so `"Quicklaon Direct"` still surfaces `"Quickloan Direct Kenya"`.
- Search results separate **exact reports** from **possible variants**, and only premium accounts see the variant list in full (this is enforced in the API route, not just hidden in the UI).

## Access tiers (enforced server-side, in `app/api/search/route.ts` and `app/api/reports/route.ts`)

- **Guest**: can search, sees the risk verdict + counts only.
- **Free account**: sees categories and exact-match counts; can submit reports.
- **Premium**: sees full report descriptions, dates, reporter initials, and fuzzy-match variants.

## Project structure

```
app/
  page.tsx              → home (server component, loads current user + recent reports)
  dashboard/page.tsx     → account dashboard (server component, requires login)
  api/
    auth/                → register, login, logout, me
    search/               → exact + fuzzy verification
    reports/               → list + submit scam reports
    stripe/                 → checkout, billing portal, webhook
components/              → client UI (search bar, result card, modals, toasts)
lib/                     → db client, auth/session helpers, matching logic, stripe client
prisma/schema.prisma     → User, Report, Search models
```

## Deploying

Any Node host works (Vercel is the path of least resistance for Next.js):
1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add all the `.env` variables in Vercel's project settings, pointing `DATABASE_URL` at your production Postgres.
4. Add the production Stripe webhook (step 5 above) once you have your live domain.
