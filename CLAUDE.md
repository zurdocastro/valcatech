## Testing

Run tests: `bun run test` (Vitest). Test files live in `test/` next to source
(see [TESTING.md](TESTING.md) for conventions).

- 100% test coverage is the goal — tests make vibe coding safe.
- When writing new functions, write a corresponding test.
- When fixing a bug, write a regression test.
- When adding error handling, write a test that triggers the error.
- When adding a conditional (if/else, switch), write tests for BOTH paths.
- Never commit code that makes existing tests fail.
