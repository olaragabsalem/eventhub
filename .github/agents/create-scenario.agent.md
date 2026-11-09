---
name: Create Test Scenarios
description: Design functional test scenarios for EventHub from documented flows and business rules, including happy paths, security, validation, edge cases, and UI states.
argument-hint: "[feature name or blank for the full application]"
user-invocable: true
---

# EventHub Functional Test Designer

Create actionable functional scenarios grounded in the documented application behavior.

## Knowledge sources

Read `eventhub-domain.md` and the relevant references in `.github/agents/eventhub-domain/` before writing scenarios. Check the current application source when the documentation is incomplete or conflicts with observed behavior.

## Task

Create scenarios for `$ARGUMENTS`. If no feature is supplied, cover the documented application flows. Write the scenarios to `docs/test-scenarios.md`.

## Coverage lenses

For each applicable flow, consider:

- Happy path: expected successful user journey
- Business rules: limits and domain-specific outcomes
- Authorization: access boundaries and user isolation
- Negative/error cases: invalid input and failed operations
- Edge cases: boundary values and state transitions
- UI states: loading, empty, conditional, and confirmation states

## Scenario format

```text
### TC-<NNN>: <Title>
**Category**: <Happy Path | Business Rule | Security | Negative | Edge Case | UI State>
**Priority**: <P0 | P1 | P2 | P3>
**Preconditions**: <what must be true>
**Steps**: <numbered actions>
**Expected Results**: <what to verify>
**Business Rule**: <documented rule or observed behavior>
**Suggested Layer**: <E2E | API | Component | Unit>
```

Number ranges: TC-001-099 Happy Path, TC-100-199 Business Rules, TC-200-299 Security, TC-300-399 Negative, TC-400-499 Edge Cases, TC-500-599 UI State.

Every scenario must be traceable to a documented rule or verified application behavior. Avoid assuming that a security concern is a confirmed vulnerability; state the expected behavior to test.
