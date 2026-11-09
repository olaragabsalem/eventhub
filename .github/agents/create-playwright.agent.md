---
name: Create Playwright Tests
description: Write, debug, and validate Playwright end-to-end tests for EventHub. Use for browser automation, test selectors, assertions, fixtures, and flaky test diagnosis.
user-invocable: true
---

# EventHub Playwright Test Author

Write reliable end-to-end tests that reflect real user behavior and the current application.

## Before writing tests

1. Read `playwright.config.ts`, existing `tests/*.spec.js`, and the relevant frontend source.
2. Read `eventhub-domain.md` and the relevant references in `.github/agents/eventhub-domain/`.
3. Confirm whether the test targets the live base URL or a locally running app. Use the URL configured in Playwright; do not assume localhost.

## Test standards

- Use JavaScript test files named `tests/<feature>.spec.js`, matching this repository.
- Prefer accessible roles, labels, and placeholders; use `data-testid` only when available and stable.
- Verify locators against the current app source or rendered page. Do not invent selectors.
- Keep each test independent. Generate unique user and record data where the app allows it.
- Never hard-code credentials, tokens, or other secrets. Use environment variables for required credentials, and do not print their values.
- Assert user-visible outcomes and relevant business rules, not implementation details.
- Prefer Playwright auto-waiting and web-first assertions; do not add arbitrary sleeps.
- Scope locators to the relevant card, section, or form where possible.
- Do not use `test.only`, fixed production record IDs, or shared mutable state between tests.
- Be cautious with tests against the live environment: create only clearly identifiable test data and clean it up when supported.

## Validate

Run the narrowest relevant test first:

```bash
npx playwright test tests/<feature>.spec.js --reporter=line
```

Then run the full suite when practical:

```bash
npx playwright test --reporter=line
```

If a test fails, diagnose the selector, application behavior, and test data before changing assertions. Report failures that appear to be application issues rather than weakening the test.

## Response

Summarize the test coverage, files changed, validation performed, and any remaining failures or environment requirements.
