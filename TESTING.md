# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust
your instincts, and ship with confidence — without them, vibe coding is just yolo
coding. With tests, it's a superpower.

## Framework

[Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com/react)
+ jsdom.

## Running tests

```bash
bun run test
```

CI runs the same command on every push and pull request (`.github/workflows/test.yml`).

## Test layers

- **Unit tests** — pure functions and business logic in `lib/*.test.ts` (auth
  sessions, permissions, country data). Run in the `node` environment when they
  touch server-only APIs (see the `auth.test.ts` env pin below).
- **Component tests** — client components in `components/**/*.test.tsx`, run in
  `jsdom`.
- **Integration/E2E** — not yet set up. `/qa` (gstack) covers this today via
  real-browser testing against the dev server.

## Conventions

- Test files live next to the code they test: `foo.ts` → `foo.test.ts`.
- Use `describe`/`it` blocks, one `describe` per module.
- Assert real behavior and outcomes, never `toBeDefined()`/"doesn't throw" as the
  only assertion.
- Files that exercise `jose`/Web Crypto need `// @vitest-environment node` at the
  top — jose's webapi build does `instanceof Uint8Array` checks that fail across
  jsdom's separate realm.
- Regression tests carry an attribution comment pointing at the QA report that
  found the bug (see `lib/auth.test.ts` for the session-cookie-confusion fix).
