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
- Keep all test assets under `tests/`: manage TC definitions and execution history in `tests/test-cases/qa-test-cases.csv`. Keep every non-code test-data file and environment-information template under `tests/test-data/`, including `<menu>.yml` and `.env.example`; loader and validation source code stays under `tests/support/`. YAML credential fields must reference environment-variable names and never contain plaintext credentials.
- For live UI demonstrations, operate the visible browser without generating chat screenshots unless explicitly requested.
- Update `docs/CODEX_CONTEXT.md` after meaningful decisions or blockers.
