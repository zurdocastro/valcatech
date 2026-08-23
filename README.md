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

Dark violet-black canvas — a live operations canvas, not a generic dark mode.
Grounded in Refero research: n8n as the primary reference (workflow canvas at
midnight), Oxide Computer for monospace/technical discipline, Langbase for the
faint grid and data-as-motion. Tokens sit at the top of `app/globals.css`.

| Role | Token | Value |
|---|---|---|
| Page canvas | `--void` | `#0e0918` |
| Card surface | `--surface-1` | `#1a1624` |
| Panel surface | `--surface-2` | `#1b1728` |
| Hairline | `--edge` | `#3e3a46` |
| Headings / body / muted | `--t-hi` `--t-body` `--t-mute` | `#ffffff` `#d1cece` `#9d9797` |
| Signal (action + status) | `--signal` | `#b8ff2e` |
| Current (connectivity) | `--current-from` → `--current-to` | `#6f58cd` → `#a78bfa` |

Rules worth knowing before changing anything visual. These are the traits the
reference lock preserves; softening them collapses the direction:

- **The violet undertone is load-bearing.** Never substitute `#000` or a neutral
  charcoal for `--void`. A neutral dark reads as generic dark mode; the violet
  reads as technology.
- **Two accent colours, two fixed roles, no crossover.** `--signal` (lime) is
  action and status only — buttons, chips, live values, graph pulses. It is
  never a background, never a section fill, never decorative. `--current`
  (violet gradient) is connectivity only — graph edges, link underlines, focus
  rings. It is never an action colour.
- **Elevation is a colour step, never a shadow.** Three surfaces exist: void →
  card → panel. Drop shadows are not used anywhere on the marketing site.
- **Display type is weight 300**, up to about 58px, tracking `-0.02em`,
  line-height `0.88`. Headlines carry by scale, not thickness. Bold display type
  breaks the register. Going larger than ~58px also overflows the hero column.
- **Monospace is for technical data only** — node labels, metrics, section
  numbers, status chips. Never for prose. JetBrains Mono via `--font-mono-real`.
- **Radius tiers:** 8px buttons and inputs, 16px cards, 24px large panels,
  9999px for chips and pills only.
- **Sections alternate `.s-void` and `.s-panel`.** There are no divider lines
  between sections — a section change *is* a background change.
- Imagery is code-native: animated SVG and canvas, no photography. The hero
  graph lives in `components/site/OpsCanvas.tsx`, with its geometry extracted to
  `lib/ops-graph.ts` so it can be tested without loading GSAP.

Marketing classes are all scoped under `.site`. That is not cosmetic: the
backoffice defines `.btn-ghost`, `.card` and `.field` later in the same
stylesheet, so an unscoped marketing rule loses to it silently.

`--ink` belongs to the backoffice and is a different colour from anything here;
the two collided once and the later definition silently won.

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
- **`ResizeObserver` is starved in a hidden tab too** — it is delivered with the rendering
  steps. `DotField` keeps a `window.resize` listener beside the observer for that reason.
  Neither fires in the automated browser, so the resize path cannot be verified there;
  dispatch a synthetic `resize` to exercise the handler instead.
- **Never verify canvas or GSAP work from a screenshot.** The automated browser reports
  `document.hidden: true`, so tweens freeze at their start values and the copy looks
  missing when it is fine. Measure the DOM, or force `.reveal` elements to
  `transform: none; opacity: 1` before capturing. To prove canvas paint order, fill the
  canvas with a solid colour and check whether the text survives.
- **`bun run build` clobbers the dev server's `.next/`.** The running server then serves
  stale HTML indefinitely and your edits look like they did not apply. Stop the preview
  before building, or `rm -rf .next` and restart it.
- **A positioned canvas paints above in-flow text.** `position: fixed` with `z-index: 0`
  still outranks non-positioned content, so `.hero .wrap` carries `position: relative;
  z-index: 1` to keep the copy above the speck field.
- **`grid-template-columns: 1fr` is not the same as `minmax(0, 1fr)`.** `1fr`
  carries an `auto` minimum, so a wide child (the hero's metrics row) pushes the
  track past the viewport. Combined with the hero's `overflow: hidden` this
  clips content silently instead of showing a scrollbar — no horizontal overflow
  is reported, and the bug is invisible unless you compare a child's width to
  its track's.
- **A flex or centred parent shrinks `.wrap` to its content.** `.site .hero` is
  a flex row, so `.hero .wrap` needs an explicit `width: 100%` or both grid
  columns collapse. This has now bitten twice.
- **`.site section` (0,1,1) outranks a bare `.hero` (0,1,0)**, so section-level
  overrides need the `.site` prefix to survive.
- **The Browser pane's console panel accumulates across reloads and server
  restarts.** Errors from an earlier broken build keep reappearing. Open a fresh
  tab before concluding an error is real.
- **Test files sit next to their source** as `*.test.ts`. See `TESTING.md`.

## Conventions

- Bun, not npm. `bun install`, `bun run <script>`, `bunx`.
- Write a test with new logic, a regression test with a bug fix, and both branches of a
  new conditional. Never commit with failing tests.
- Comments explain *why*, not what. Prefer the smallest change that actually fixes the
  cause.

<!-- git-connected: pushes to main deploy automatically -->
