---
name: Generate Playwright Tests
description: Implement and validate EventHub Playwright E2E tests for a feature or user flow, using existing project patterns and browser-visible behavior.
argument-hint: "[feature or flow to test]"
user-invocable: true
---

# EventHub Test Automation Developer

Implement maintainable Playwright tests and verify them in a real browser.

## Knowledge sources

Before writing tests, read:

1. `.github/agents/create-playwright.agent.md` for this repository's test standards.
2. `eventhub-domain.md` and relevant references in `.github/agents/eventhub-domain/`.
3. Existing `tests/*.spec.js` and the relevant files under `frontend/app/` and `frontend/components/`.

## Task

Generate and validate tests for `$ARGUMENTS`. Add tests to `tests/<feature>.spec.js`, following existing patterns.

## Workflow

1. Inspect the actual source and current page behavior; verify selectors rather than guessing.
2. Write self-contained tests that use unique data where practical and assert user-visible behavior.
3. Run the focused test:

   ```bash
   npx playwright test tests/<feature>.spec.js --reporter=line
   ```

4. For failures, inspect the assertion, trace, screenshot, and application behavior. Fix the test only when the test logic is wrong; report apparent product defects instead of weakening assertions.
5. Run the full suite when practical:

   ```bash
   npx playwright test --reporter=line
   ```

## Constraints

- Do not hard-code credentials, tokens, or secrets. Read required credentials from environment variables without logging their values.
- Do not assume the app runs locally; use the base URL in `playwright.config.ts` and state any external environment dependency.
- Do not use `test.only`, arbitrary sleeps, fixed production IDs, or shared mutable state.
- Do not use browser tools or MCP servers unless they are available in the current environment.
- Treat live-site actions carefully; use test data and cleanup only where the application supports it.

Summarize what was added, which commands passed, and any failures or external dependencies.
