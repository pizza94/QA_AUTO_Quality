# QA automation project instructions

- Communicate primarily in concise Korean and lead with the result.
- Report work results as natural prose without diff statistics such as `(+1 -0)`, file-by-file change lists, tables, or patch details unless the user explicitly requests them.
- Read `docs/CODEX_CONTEXT.md` and check Git status before meaningful work.
- Load the login URL and credentials from the Git-ignored local YAML referenced by `tests/test-data/login.yml`. Never commit the populated local YAML or real secrets.
- Prefer focused Chromium tests during development and expand browser coverage only when requested.
- Preserve unrelated user changes.
- Do not commit or push completed work automatically. Commit only when the user explicitly requests a commit, and push only when the user explicitly requests a push.
- Keep failure logs under `logs/test-errors/YYYY-MM-DD/` using the Asia/Seoul execution date; include automatic category/cause/action analysis and do not commit generated `.log` files.
- Record meaningful work in `docs/work-log/YYYY-MM-DD.md` using the Asia/Seoul date.
- Keep each QualityStream menu under `tests/modules/<menu>/` with separate page, flow, and spec responsibilities.
- Keep all test assets under `tests/`: manage TC definitions and execution history in `tests/test-cases/qa-test-cases.csv`. Keep every non-code test-data file and environment-information template under `tests/test-data/`, including `<menu>.yml`; loader and validation source code stays under `tests/support/`. Real login values may exist only in the Git-ignored `*.local.yml` file referenced by `login.yml`.
- Run browser tests headlessly by default. Show or preserve a visible browser UI only when the user explicitly requests a live demonstration, and do not generate chat screenshots unless explicitly requested.
- Never directly operate the user's visible browser for test execution or inspection. When a visible demonstration is requested, provide or run an explicit Playwright headed command and keep normal development and verification headless.
- Use each TC-specific command for isolated headless execution. Launch visible UI only with `npm.cmd run test:headed`; the full procedure must use one browser page and session, log in only in TC-001, and let every later TC continue from the preceding TC without replaying earlier steps.
- Whenever a TC is added, add its own `test.step` to `tests/procedures/full-quality-procedure.spec.ts` in TC order so `test:headed` always covers the complete procedure.
- QualityStream keeps prior menu DOM and query state. After entering a menu that has a search button, click that menu's scoped search button once to initialize its data, and scope duplicate IDs and filters to the active menu region.
- The user has pre-approved headless immediate execution of the latest `수집테스트자동N` metadata-collection reservation. Do not ask again unless the target, scope, or side effect changes; allow up to five minutes for collection-status verification.
- Update `docs/CODEX_CONTEXT.md` after meaningful decisions or blockers.
