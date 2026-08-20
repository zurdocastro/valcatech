# VALCA Tech

Marketing site and lead backoffice for VALCA Tech, an AI solutions firm.

**Live:** [valcatech.vercel.app](https://valcatech.vercel.app) · Backoffice at `/admin`

Next.js 16 (App Router) · React 19 · Prisma 7 on Turso (libSQL) · Resend · Anthropic · Vercel

---

## Quick start

```bash
bun install
bunx prisma db push   # creates ./dev.db from prisma/schema.prisma
bun run seed          # super admin + chat-agent settings
bun run dev
```

Seeded login: `admin@valcatech.com` / `admin123`. Change it from `/admin/users` before
using the deployed site.

```bash
bun run test    # vitest
bun run build   # prisma generate && next build
```

Copy `.env.example` to `.env.local` and fill what you need. With `TURSO_DATABASE_URL`
empty, `lib/db.ts` falls back to the local `dev.db` file, so nothing else is required to
run the site locally.

---

## What is where

| Path | Role |
|---|---|
| `app/page.tsx` | The whole marketing page. Sections are plain markup; copy comes from `lib/content.ts`. |
| `lib/content.ts` | Every word on the marketing site. The chat agent builds its system prompt from the same constants, so the two can't drift. |
| `app/globals.css` | Design tokens and the two themes: `.site` (dark marketing) and the backoffice's light classes. |
| `components/site/ui.tsx` | `Reveal` (GSAP split-line text animation), `StatCounter`, `Faq`. |
| `app/admin/**` | Backoffice: dashboard, leads, chat agent, email campaigns, affiliates, discount codes, users. |
| `app/api/**` | Route handlers. `contact` and `chat` are public; everything else requires an admin session. |
| `lib/chatAgent.ts` | The site chat agent. One tool, `capture_lead`. |
| `prisma/schema.prisma` | Database schema. |

## Design system

Warm light canvas with alternating section surfaces, measured from the reference
site the design follows. Tokens sit at the top of `app/globals.css`.

| Role | Token | Value |
|---|---|---|
| Page canvas | `--paper` | `#faf9f5` |
| Alternate surface | `--beige` | `#f1eee6` |
| Alternate surface | `--white-pure` | `#ffffff` |
| Accent band | `--lavender` | `#cfc4f7` |
| Contrast band | `--ink-surface` | `#151312` |
| Action | `--lime` | `#b8ff2e` |
| Headings / body / muted | `--ink-head` `--ink-body` `--ink-muted` | `#171412` `#2e2a25` `#6e685f` |

Rules worth knowing before changing anything visual:

- **Sections alternate surfaces**, in this order: paper, ink, beige, paper,
  lavender, ink, white, ink. Run them all on one surface and the page flattens
  into a single sheet — the alternation is what gives it rhythm.
- Apply a surface with its class (`.s-paper`, `.s-ink`, `.s-beige`,
  `.s-white`, `.s-lavender`). `.s-ink` re-tints its own children, so text inside
  a dark band needs no extra colour.
- Display type is **weight 400** at large scale with about `-0.02em` tracking.
  Small headings step up to 500 or 600.
- `--lime` is the action colour, used on filled buttons only.
- Inter throughout, matching the reference.

`--ink` belongs to the backoffice and is a different colour. The marketing dark
band is `--ink-surface`; the two collided once and the later definition silently
won.

## Backoffice

Session cookie `valca_admin_session`, signed with `AUTH_SECRET`. Roles: `super_admin`,
`admin`, `viewer`, `affiliate` — the middleware confines an affiliate session to
`/admin/affiliates` and its own API routes.

Leads arrive as `Customer` rows with `source` set to `contact_form`, `chat` or `manual`,
and the visitor's own description in `notes`.

## Deploying

Vercel project `valcatech`, Turso database `valcatech`.

```bash
vercel --prod
```

Environment variables:

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Signs admin session JWTs. Long random string. |
| `NEXT_PUBLIC_APP_URL` | Used for metadata and OG tags. |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Database. |
| `RESEND_API_KEY`, `RESEND_FROM`, `SUPPORT_EMAIL` | Email. |
| `ANTHROPIC_API_KEY` | Site chat agent. Without it the widget degrades to a "write to us" fallback. |
| `BLOB_READ_WRITE_TOKEN` | Image uploads in the email composer. |
| `RESEND_WEBHOOK_SECRET` | Verifies `/api/webhooks/resend` delivery events. |

### Schema changes reach Turso through a generated script

Prisma's SQLite datasource does not accept a `libsql://` URL, so `prisma db push` only
ever touches the local `dev.db`:

```bash
bunx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o schema.sql
turso db shell <database> < schema.sql
```

For an incremental change, diff against the previous schema instead of `--from-empty`, or
hand-write the `ALTER TABLE`.

## Landmines

Things that have already cost time here.

- **Never copy another project's `.env.local`.** Doing so once pointed
  `TURSO_DATABASE_URL` at a different product's production database and the seed wrote to
  it. `lib/db.ts` now treats an empty string as unset, but the file itself is the hazard.
- **An empty env var is truthy.** `process.env.X ?? fallback` keeps `""`. Use `||`.
- **The schema still carries e-commerce tables** (`Product`, `Order`, `OrderItem`,
  `OperationalExpense`, …) inherited from the template this was cloned from. Nothing
  writes to them, but `Affiliate` and `DiscountCode` hold relations to `Order`, so they
  stay. Empty tables cost nothing.
- **`reactStrictMode` is off** in `next.config.ts` — Strict Mode's double-effect races
  `gsap.context().revert()` and leaves timelines stuck mid-tween. Production never
  double-invokes regardless.
- **`requestAnimationFrame` is paused in background tabs**, so canvas and GSAP work stops.
  The canvas paints one frame synchronously on mount to cover that.
- **Test files sit next to their source** as `*.test.ts`. See `TESTING.md`.

## Conventions

- Bun, not npm. `bun install`, `bun run <script>`, `bunx`.
- Write a test with new logic, a regression test with a bug fix, and both branches of a
  new conditional. Never commit with failing tests.
- Comments explain *why*, not what. Prefer the smallest change that actually fixes the
  cause.

<!-- git-connected: pushes to main deploy automatically -->
