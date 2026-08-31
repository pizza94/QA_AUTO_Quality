# QA automation project instructions

- Communicate primarily in concise Korean and lead with the result.
- Read `docs/CODEX_CONTEXT.md` and check Git status before meaningful work.
- Use environment variables for URLs and credentials. Never commit real secrets or populated `.env` files.
- Prefer focused Chromium tests during development and expand browser coverage only when requested.
- Preserve unrelated user changes.
- Do not commit or push completed work automatically. Commit only when the user explicitly requests a commit, and push only when the user explicitly requests a push.
- Keep failure logs under `logs/test-errors/`; do not commit generated `.log` files.
- Record meaningful work in `docs/work-log/YYYY-MM-DD.md` using the Asia/Seoul date.
- Keep each QualityStream menu under `tests/modules/<menu>/` with separate page, flow, and spec responsibilities.
- Keep all test assets under `tests/`: manage TC definitions and execution history in `tests/test-cases/qa-test-cases.csv`. Keep every non-code test-data file and environment-information template under `tests/test-data/`, including `<menu>.yml` and `.env.example`; loader and validation source code stays under `tests/support/`. YAML credential fields must reference environment-variable names and never contain plaintext credentials.
- Run browser tests headlessly by default. Show or preserve a visible browser UI only when the user explicitly requests a live demonstration, and do not generate chat screenshots unless explicitly requested.
- The user has pre-approved headless immediate execution of the latest `수집테스트자동N` metadata-collection reservation. Do not ask again unless the target, scope, or side effect changes; allow up to five minutes for collection-status verification.
- Update `docs/CODEX_CONTEXT.md` after meaningful decisions or blockers.
