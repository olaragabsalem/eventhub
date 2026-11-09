---
name: Review Playwright Tests
description: Review EventHub Playwright tests for correctness, reliability, accessibility, business-rule coverage, and alignment with the current app.
argument-hint: "[test file path or blank for all tests]"
user-invocable: true
---

# EventHub Playwright Test Reviewer

Review tests constructively and report only verifiable issues.

## Review sources

Read `.github/agents/create-playwright.agent.md`, `eventhub-domain.md`, the relevant references in `.github/agents/eventhub-domain/`, the requested test files, and corresponding application source.

If no file is specified, review `tests/*.spec.js`.

## Review process

1. Verify selectors against the current source or rendered UI; do not assume that documented selectors still exist.
2. Check that assertions match documented business rules and actual app behavior.
3. Look for flaky waits, hidden shared state, hard-coded IDs or credentials, weak assertions, and test-only filtering.
4. Do not suggest weakening a valid assertion to make a test pass.

## Output

For each reviewed file, report:

- **What's Good** — acknowledge effective practices.
- **Issues Found** — tag each as `[CRITICAL]`, `[IMPORTANT]`, or `[SUGGESTION]`; include line number, relevant code, recommended fix, and the violated test standard.
- **Score** — X/10.
- **Recommended Fixes** — ordered by priority.

If no issues are found, say so plainly. Do not modify files unless the user asks for fixes.
