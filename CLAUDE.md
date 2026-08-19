See [AGENTS.md](AGENTS.md) for how to work in this repo, and [README.md](README.md) for
the architecture, design rules and known landmines.

## Testing

Run tests: `bun run test` (Vitest). Test files live next to their source as `*.test.ts`
(see [TESTING.md](TESTING.md) for conventions).

- When writing new functions, write a corresponding test.
- When fixing a bug, write a regression test.
- When adding error handling, write a test that triggers the error.
- When adding a conditional, write tests for both paths.
- Never commit code that makes existing tests fail.
