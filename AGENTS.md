# QA automation project instructions

- Communicate primarily in concise Korean and lead with the result.
- Read `docs/CODEX_CONTEXT.md` and check Git status before meaningful work.
- Use environment variables for URLs and credentials. Never commit real secrets or populated `.env` files.
- Prefer focused Chromium tests during development and expand browser coverage only when requested.
- Preserve unrelated user changes.
- Keep failure logs under `logs/test-errors/`; do not commit generated `.log` files.
- For live UI demonstrations, operate the visible browser without generating chat screenshots unless explicitly requested.
- Update `docs/CODEX_CONTEXT.md` after meaningful decisions or blockers.

