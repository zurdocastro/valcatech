# Working on this repo as an AI agent

Read [README.md](README.md) first — it has the architecture, the design rules and a
"Landmines" section listing what has already gone wrong here. This file covers how to
work, not what the code is.

## Before you change anything visual

The design follows a published spec, summarised in the README. Its distinctive traits are
easy to sand off by accident: weight-400 headlines, weight-200 body, pure black canvas, a
single violet reserved for filled actions, and **no borders, dividers or shadows at all**.
If a change would introduce any of those, it is almost certainly wrong.

Do not invent design decisions. Several were added here without a source — a nav underline,
hairline dividers, drop shadows — and all had to be removed later. If a choice can't be
traced to the spec or to an explicit instruction, don't ship it.

## Verify before you ship, not after

This is the single biggest lesson from this project's history. Rounds were lost shipping
shapes and layouts that turned out not to work, then asking whether they looked right.

- **Canvas shapes:** render the mask and read it back as an ASCII luminance map. The
  snippet is in the README.
- **Layout and tokens:** query computed styles in the page rather than eyeballing a
  screenshot. `getComputedStyle` on a real element beats a guess.
- **Geometry:** measure the canvas pixel bounding box. Aspect ratio and centre position
  tell you which shape is on screen and where, deterministically.
- **Filter by alpha when measuring the canvas.** The foreground glyph layer spans the
  whole viewport at low opacity and will otherwise contaminate any bounding box. A
  threshold around alpha 80 isolates the main shape.

## Screenshots may lie

Automated browsers here often report the document as hidden, which pauses
`requestAnimationFrame`. Canvas frames and GSAP tweens then freeze at their start values,
and screenshots show a stale frame. If something looks broken in a screenshot, check
`document.hidden` before believing it. Measure the DOM instead.

Similarly, forcing a redraw via a `resize` event needs spacing greater than the 150 ms
debounce in `Constellation.tsx`, or the timer resets and almost no frames run. That has
produced false "it isn't converging" conclusions.

## Database

`prisma db push` cannot reach Turso. Generate SQL and pipe it through `turso db shell` —
see the README. And never point a local `.env.local` at a production database.

## Scope

Prefer the smallest change that fixes the cause. Reuse what is already here before adding
anything; check the installed dependencies before reaching for a new one. Do not add
abstractions for a single caller, and do not scaffold for hypothetical future needs.
