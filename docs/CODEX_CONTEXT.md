# Codex durable project context

Last updated: 2026-08-31 (Asia/Seoul)

## Project identity

- Local repository: `C:\Users\HSJ\Documents\QA_AUTO_퀄리티`
- Purpose: Playwright-based web UI QA automation for the QualityStream product.
- Target login URL has been supplied but must remain runtime-only in `PLAYWRIGHT_LOGIN_URL`.

## Current state

- Initial Chromium Playwright scaffold created.
- Failed tests write dedicated logs to `logs/test-errors/YYYY-MM-DD/*.log` using the Asia/Seoul execution date; each log includes deterministic failure category, likely cause, and recommended action analysis.
- Browser console warnings/errors and uncaught page errors are attached to failed-test logs.
- Login URL and credentials are loaded from the Git-ignored local YAML referenced by `tests/test-data/login.yml`; the populated local file must never be committed.
- TC scenarios use a one-way sequential flow: enter the screen, input data, execute the action, verify the result, then advance to the next step without navigating backward.
- Browser tests run headlessly by default. Show or preserve visible browser UI only when the user explicitly requests a live demonstration; do not generate chat screenshots unless explicitly requested.
- Visible UI demonstrations must use `npm.cmd run test:headed`. The full procedure uses one browser page and session, logs in only in TC-001, and runs later TC steps from the preceding state without replaying earlier steps; do not directly operate the user's visible browser for test execution or inspection.
- Every newly added TC must also be appended as a TC-ordered `test.step` in `tests/procedures/full-quality-procedure.spec.ts`, keeping `test:headed` complete while preserving the single-session procedure.
- QualityStream retains prior menu DOM and query state. Menu flows must click the active menu's scoped search button once after entry and scope duplicate IDs and filters to that menu region.
- Work is recorded by date under `docs/work-log/YYYY-MM-DD.md`.
- Automation is modularized per QualityStream menu under `tests/modules/<menu>/` using page, flow, and spec responsibilities.
- All test assets live under `tests/`: TC definitions and execution history are maintained in `tests/test-cases/qa-test-cases.csv`; every non-code test-data and environment-information file lives under `tests/test-data/`, while loader code stays under `tests/support/`.
- The initial smoke test is organized under `tests/modules/smoke/` with separate page, flow, and spec files as the reference module layout.
- GitHub target repository: `https://github.com/pizza94/QA_AUTO_Quality` (`origin`).
- Local `main` tracks `origin/main`; the organized project scaffold has been pushed successfully.
- The first business flow is login (`TC-001`) under `tests/modules/login/`; credentials are read only from runtime environment variables.
- Live login was verified successfully: the login form disappears, the URL leaves the login route, and the Data Portal welcome heading becomes visible.
- Git workflow: leave completed changes uncommitted by default; commit only on an explicit user request and push only on an explicit push request.
- The Data Portal renders both a hidden side link and a visible card label for quality management; automation selects the visible exact-text card.
- The tracked credential file contains only a reference to `tests/test-data/login.local.yml`; the populated local YAML is ignored and `login.local.example.yml` contains placeholders only.
- `TC-001` is documented in the master CSV and loads `tests/test-data/login.yml` for automation values.
- `TC-002` logs in, clicks the Data Portal quality-management card, and verifies the QualityStream 4.3 dashboard and primary menus using `tests/test-data/quality-management.yml`.
- `TC-003` opens Verification Target Management > Metadata Collection Management and creates a DB catalog collection reservation using `tests/test-data/metadata-collection.yml`; reservation names increment from the highest existing `수집테스트자동N` suffix.
- `TC-003` passed headless Chromium and created the reservation successfully. Select-dependent form changes reset the reservation-name field, so automation fills the generated name last.
- `TC-004` selects the highest-numbered existing `수집테스트자동N` reservation, records its history count, triggers immediate execution, and verifies both final list status and the newly added collection-history row as `완료`.
- `TC-004` passed headless Chromium in 24.3 seconds. It accepts either an observed `수집중` state or a newly added completed history row as execution evidence because a fast job or delayed list refresh can make the transient state unobservable.
- The user pre-approved repeated headless TC-004 execution without reconfirmation; status verification may wait up to five minutes because duration varies with data volume.
- `TC-005` filters unreflected DBCatalog 신규 rows for ORA19C/META42_DEV with blank system/business values, selects the visually top one row by grid position, and reflects it to 큐에이/QA상품.
- The earlier two-row version passed and reflected BAZ06B and BILLING_BASIC_INFO. The updated one-row version also passed headless Chromium after the requirement change.
- `TC-006` selects only the single most recently reflected 큐에이/QA상품 ORA19C/META42_DEV table. It reloads after each save to verify the table execution checkbox and every column's execution/column checkbox remain selected in the UI.

## Next action

- Define the next QualityStream test case after TC-006.
