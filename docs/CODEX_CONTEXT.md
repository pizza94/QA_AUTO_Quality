# Codex durable project context

Last updated: 2026-08-31 (Asia/Seoul)

## Project identity

- Local repository: `C:\Users\HSJ\Documents\QA_AUTO_퀄리티`
- Purpose: Playwright-based web UI QA automation.
- Target URL: not configured yet; set `PLAYWRIGHT_BASE_URL` locally.

## Current state

- Initial Chromium Playwright scaffold created.
- Failed tests write dedicated logs to `logs/test-errors/*.log`.
- Browser console warnings/errors and uncaught page errors are attached to failed-test logs.
- Credentials must remain in local environment variables and must not be committed.

## Next action

- Configure the real target URL and identify the first business-critical test flow.

