# Codex durable project context

Last updated: 2026-08-31 (Asia/Seoul)

## Project identity

- Local repository: `C:\Users\HSJ\Documents\QA_AUTO_퀄리티`
- Purpose: Playwright-based web UI QA automation for the QualityStream product.
- Target URL: not configured yet; set `PLAYWRIGHT_BASE_URL` locally.

## Current state

- Initial Chromium Playwright scaffold created.
- Failed tests write dedicated logs to `logs/test-errors/*.log`.
- Browser console warnings/errors and uncaught page errors are attached to failed-test logs.
- Credentials must remain in local environment variables and must not be committed.
- TC scenarios use a one-way sequential flow: enter the screen, input data, execute the action, verify the result, then advance to the next step without navigating backward.
- The final deliverable includes a live browser demonstration of each TC. Operate the visible UI directly and do not generate chat screenshots unless explicitly requested.
- Work is recorded by date under `docs/work-log/YYYY-MM-DD.md`.
- Automation is modularized per QualityStream menu under `tests/modules/<menu>/` using page, flow, and spec responsibilities.
- Non-secret TC input and expected values are stored separately under `test-data/<menu>/`; URLs and credentials remain environment variables.
- The initial smoke test is organized under `tests/modules/smoke/` with separate page, flow, and spec files as the reference module layout.
- GitHub target repository: `https://github.com/pizza94/QA_AUTO_Quality` (`origin`).
- Local `main` tracks `origin/main`; the organized project scaffold has been pushed successfully.

## Next action

- Configure the real QualityStream target URL and identify the first business-critical sequential test flow.
