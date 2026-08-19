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
| `components/site/Constellation.tsx` | The particle field. The largest and least obvious file — see below. |
| `components/site/ui.tsx` | `Reveal` (GSAP split-line text animation), `StatCounter`, `Faq`. |
| `app/admin/**` | Backoffice: dashboard, leads, chat agent, email campaigns, affiliates, discount codes, users. |
| `app/api/**` | Route handlers. `contact` and `chat` are public; everything else requires an admin session. |
| `lib/chatAgent.ts` | The site chat agent. One tool, `capture_lead`. |
| `prisma/schema.prisma` | Database schema. |

## Design system

The visual language follows a published spec (dark canvas, oversized weight-400 display
type, ultra-light weight-200 body, one violet CTA). The tokens live at the top of
`app/globals.css` in both `@theme` (Tailwind v4) and `:root` form. Rules worth knowing
before changing anything visual:

- Hierarchy comes from **scale and tracking, never weight**. Headlines are weight 400.
- Body copy is weight **200**. Not 400.
- `#8052ff` is for filled actions only — never a background for a large block.
- **No borders, no dividers, no shadows anywhere.** Whitespace carries separation. `.rule`
  exists as a zero-height spacer, deliberately invisible.
- Backgrounds are pure `#000000`. Not dark grey.

## The particle field

`components/site/Constellation.tsx` is a fixed, full-viewport 2D canvas behind the whole
page. It morphs between four point clouds — brain, sphere, lightbulb, dispersed scatter —
as you scroll.

How it fits together:

- **Sections declare slots.** Any element with `data-orb="left|right"` and
  `data-shape="brain|sphere|bulb|scatter"` claims the field. The slot nearest the middle
  of the viewport wins, and the field eases toward its side, vertical centre and shape.
  With no slot in view it falls back to a dim centred ambient state. Copy always sits in
  the opposite column, so the field never lands behind text.
- **Shapes are 3D point clouds of equal length**, so morphing is a straight lerp.
- **Silhouettes are sampled from an offscreen mask**, walked on a calibrated grid rather
  than sampled at random — the lattice rows are most of why the shapes read as objects.
- **Luminance in the mask is height**, which becomes displacement along z, and each cloud
  carries a surface normal derived from the height gradient.
- **Hue and light are separate channels.** A per-point `tint` indexes the colour ramp and
  belongs to the shape; the normal only decides brightness. The brain keys its gold off
  distance-to-edge, so the accent reads as a rim.
- **Draw calls are batched** by ramp step and depth band — a few dozen `stroke()` calls a
  frame regardless of particle count.

### Changing a shape

Do not ship a silhouette without looking at it first. Render the mask on its own and read
it back as a luminance map — in the browser console on any page of the site:

```js
const w = 340, h = Math.round(w / ASPECT);
const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
const ctx = cv.getContext('2d', { willReadFrequently: true });
drawYourShape(ctx, w, h);                       // paste the draw function in
const d = ctx.getImageData(0, 0, w, h).data;
const chars = " .:-=+*#%@";
let out = "";
for (let r = 0; r < 40; r++) {
  for (let c = 0; c < 100; c++) {
    const i = (c / 100 * w) | 0, j = (r / 40 * h) | 0, o = (j * w + i) * 4;
    out += d[o + 3] < 128 ? " " : chars[Math.min(9, (d[o] / 256 * 10) | 0)];
  }
  out += "\n";
}
console.log(out);
```

Several rounds were lost shipping shapes that turned out not to read. This check takes a
minute.

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
