# QA automation project instructions

- Communicate primarily in concise Korean and lead with the result.
- Read `docs/CODEX_CONTEXT.md` and check Git status before meaningful work.
- Use environment variables for URLs and credentials. Never commit real secrets or populated `.env` files.
- Prefer focused Chromium tests during development and expand browser coverage only when requested.
- Preserve unrelated user changes.
- Commit completed work locally, but do not push immediately. Batch-push only when the user explicitly requests it.
- Keep failure logs under `logs/test-errors/`; do not commit generated `.log` files.
- Record meaningful work in `docs/work-log/YYYY-MM-DD.md` using the Asia/Seoul date.
- Keep each QualityStream menu under `tests/modules/<menu>/` with separate page, flow, and spec responsibilities.
- Manage TC definitions and execution history in `docs/test-cases/qa-test-cases.csv`; keep non-secret automation inputs and verification values in `tests/test-data/<menu>.yml`. YAML credential fields must reference environment-variable names and never contain plaintext credentials.
- For live UI demonstrations, operate the visible browser without generating chat screenshots unless explicitly requested.
- Update `docs/CODEX_CONTEXT.md` after meaningful decisions or blockers.
