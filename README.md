# VALCA Tech

Marketing site + backoffice. Next.js 16, Prisma on Turso (libSQL), Resend for
email, Anthropic for the site chat agent. Deploys to Vercel.

- **Public site** — `app/page.tsx`, dark "Dala" design system (pure black canvas,
  Electric Iris `#8052FF`, Saffron `#FFB829`, Inter at weight 200 body / 400
  headlines). All copy lives in [lib/content.ts](lib/content.ts) — the chat agent
  builds its knowledge base from the same constants, so the two can't drift.
- **Backoffice** — `/admin`: Dashboard, Leads & Customers, Chat Agent, Emails,
  Affiliates, Discount Codes, Users.

## Local development

```bash
bun install
bunx prisma db push   # creates ./dev.db from prisma/schema.prisma
bun run seed          # super admin + chat-agent settings
bun run dev
```

Seeded login: `admin@valcatech.com` / `admin123` — change it from `/admin/users`
before going live.

`.env.local` starts with empty `TURSO_*`, so `lib/db.ts` falls back to the local
`dev.db` file. **Never paste another project's Turso URL in here** — the seed and
every API route write to whatever that variable points at.

```bash
bun run test    # vitest
bun run build   # prisma generate && next build
```

## Deploying

### 1. Turso database

```bash
turso db create valcatech
turso db show valcatech --url
turso db tokens create valcatech
```

Push the schema to it (one-off, and again after any `schema.prisma` change):

```bash
DATABASE_URL="libsql://<db>.turso.io?authToken=<token>" bunx prisma db push
```

Then seed the admin user against Turso:

```bash
TURSO_DATABASE_URL="libsql://<db>.turso.io" TURSO_AUTH_TOKEN="<token>" \
SEED_ADMIN_EMAIL="you@valcatech.com" SEED_ADMIN_PASSWORD="<strong-password>" \
bun run seed
```

### 2. Resend

Verify `valcatech.com` as a sending domain, then set `RESEND_API_KEY` and
`RESEND_FROM`. `SUPPORT_EMAIL` is where new-lead notifications land, and it is
the Reply-To on outgoing mail.

### 3. Vercel

```bash
vercel link      # create a NEW project — do not link an existing one
vercel env add   # for each variable below
vercel --prod
```

Required environment variables:

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Signs admin session JWTs. Long random string. |
| `NEXT_PUBLIC_APP_URL` | `https://valcatech.com` — used for metadata/OG. |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Database. |
| `RESEND_API_KEY`, `RESEND_FROM`, `SUPPORT_EMAIL` | Email. |
| `ANTHROPIC_API_KEY` | Site chat agent. Without it the widget degrades to a "write to us" fallback. |
| `BLOB_READ_WRITE_TOKEN` | Image uploads in the email composer. |
| `RESEND_WEBHOOK_SECRET` | Verifies `/api/webhooks/resend` delivery events. |

Point the Resend webhook at `https://valcatech.com/api/webhooks/resend` so
campaign delivery/open/bounce counts populate.

## Notes

- The schema still carries the e-commerce tables (`Product`, `Order`,
  `OrderItem`, …) inherited from the template. Nothing in the UI writes to them;
  they stay because `Affiliate` and `DiscountCode` — both kept in the backoffice
  — hold relations to `Order`. Empty tables cost nothing.
- Lead capture writes to `Customer` (`source` = `contact_form` | `chat` |
  `manual`), with the visitor's own description in `notes`.
