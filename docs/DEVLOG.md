# DEVLOG.md — project diary (newest first)
*Written by `/implement` (drafts) and `/end-of-day` (final). Plain language: what happened, what was decided, why.*
## 2026-10-11 — Phase 0 Completion: P0-T3, P0-T4, P0-T5 (in review on feat/phase0-completion)
- P0-T3: Ported all 5 verification scripts into pure Vitest tests in `tests/unit/` (`gst-calculation.test.ts`, `invoice-validation.test.ts`, `gst-kpis.test.ts`). Deleted `scripts/`.
- P0-T4: Removed query logging from `lib/db/prisma.ts` (dev opt-in via `LOG_QUERIES=true`). Added structured logger `lib/logger.ts` with PII redaction. Added production guard to `prisma/seed.ts`. Moved credentials to `docs/dev-setup.md`. Replaced `db push` with `prisma migrate dev`. Confirmed 9 baseline migrations are up to date.
- P0-T5: Scaffolded documentation skeleton across `docs/architecture/`, `docs/domain/`, `docs/adr/`, `docs/api/`, `docs/user-guide/`, and `docs/runbooks/`. Added `docs/domain/glossary.md` and `docs/adr/template.md`.
- Quality gates: 23 unit tests passing, typecheck clean, lint clean (0 errors), prettier check clean, production build clean.

## 2026-10-11 — P0-T2: Tooling (merged into dev via PR #11)
- Installed `vitest` test runner, `zod` for boundary runtime validation, and `prettier` for code formatting. Documented in `docs/adr/0000-tooling-dependencies.md`.
- Implemented `lib/env.ts` schema validation for environment variables and created `.env.example`.
- Added unit tests in `tests/unit/` (`smoke.test.ts`, `env.test.ts`) — 7 tests passing.
- Configured ESLint 9 rules in `eslint.config.mjs` and Prettier in `.prettierrc` / `.prettierignore`.
- Configured GitHub Actions CI workflow in `.github/workflows/ci.yml` (typecheck, lint, formatting, test, build).
- Verified `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` pass cleanly.

## 2026-10-11 — P0-T1: Baseline snapshot (merged into dev via PR #10)
- Verified prototype build passes cleanly with `npm run build` (Next.js 16.1.4 Turbopack, React 19).
- Exported synthetic database baseline fixtures to `docs/fixtures/` (`baseline-seed.json` with 10 models, `baseline-seed.sql`).
- Confirmed git tag `v0-prototype` identifies the prototype baseline.
- Documented baseline release and feature set in `CHANGELOG.md` and `docs/fixtures/README.md`.

## 2026-10-10 — Project set-up
- Added the agent operating pack (AGENTS.md, .agent/, docs/).
- Decisions: solo developer in Antigravity; wedge = Weekly Cash Plan for Tally-based B2B manufacturers/traders; build foundation first, test demand with pilots in parallel.
- Next: P0-T1.
