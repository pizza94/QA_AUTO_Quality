# Codex durable project context

Last updated: 2026-08-31 (Asia/Seoul)

## Project identity

- Local repository: `C:\Users\HSJ\Documents\QA_AUTO_퀄리티`
- Purpose: Playwright-based web UI QA automation for the QualityStream product.
- Target login URL has been supplied but must remain runtime-only in `PLAYWRIGHT_LOGIN_URL`.

## Current state

- Initial Chromium Playwright scaffold created.
- Failed tests write dedicated logs to `logs/test-errors/*.log`.
- Browser console warnings/errors and uncaught page errors are attached to failed-test logs.
- Credentials must remain in local environment variables and must not be committed.
- TC scenarios use a one-way sequential flow: enter the screen, input data, execute the action, verify the result, then advance to the next step without navigating backward.
- Browser tests run headlessly by default. Show or preserve visible browser UI only when the user explicitly requests a live demonstration; do not generate chat screenshots unless explicitly requested.
- Work is recorded by date under `docs/work-log/YYYY-MM-DD.md`.
- Automation is modularized per QualityStream menu under `tests/modules/<menu>/` using page, flow, and spec responsibilities.
- All test assets live under `tests/`: TC definitions and execution history are maintained in `tests/test-cases/qa-test-cases.csv`; every non-code test-data and environment-information file lives under `tests/test-data/`, while loader code stays under `tests/support/`.
- The initial smoke test is organized under `tests/modules/smoke/` with separate page, flow, and spec files as the reference module layout.
- GitHub target repository: `https://github.com/pizza94/QA_AUTO_Quality` (`origin`).
- Local `main` tracks `origin/main`; the organized project scaffold has been pushed successfully.
- The first business flow is login (`TC-001`) under `tests/modules/login/`; credentials are read only from runtime environment variables.
- Live login was verified successfully: the login form disappears, the URL leaves the login route, and the Data Portal welcome heading becomes visible.
- Git workflow: create local commits for completed work, and batch-push only on an explicit user request.
- YAML credential fields contain environment-variable references, never plaintext secrets.
- The environment template is `tests/test-data/.env.example`; it contains placeholders only.
- `TC-001` is documented in the master CSV and loads `tests/test-data/login.yml` for automation values.
- `TC-002` logs in, clicks the Data Portal quality-management card, and verifies the QualityStream 4.3 dashboard and primary menus using `tests/test-data/quality-management.yml`.
- `TC-003` opens Verification Target Management > Metadata Collection Management and creates a DB catalog collection reservation using `tests/test-data/metadata-collection.yml`; reservation names increment from the highest existing `수집테스트자동N` suffix.

## Next action

- Execute and verify the live save step for `TC-003` after receiving action-time confirmation.
