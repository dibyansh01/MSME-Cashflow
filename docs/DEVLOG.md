# DEVLOG.md — project diary (newest first)
*Written by `/implement` (drafts) and `/end-of-day` (final). Plain language: what happened, what was decided, why.*

## 2026-10-11 — P1-T1: Money helpers & Decimal migration plan (in review on `feat/p1-t1-money-helpers`)
- Implemented `lib/money.ts` providing pure Decimal arithmetic (`d`, `zero`, `add`, `sub`, `mul`, `div`, `pct`, `roundHalfUp2`, `roundBankers2`, `allocate`, `eq`, `gt`, `gte`, `lt`, `lte`, `isZero`, `isPositive`, `isNegative`, `formatINR`). Zero new dependencies (reuses `Prisma.Decimal` backed by `decimal.js`).
- Addressed banking-grade financial rounding: unrounded intermediate calculations, round-half-up for Indian GST/statutory compliance, banker's round-half-to-even for banking reconciliation, zero-loss multi-part apportionment via largest-remainder algorithm (`allocate`), and residual tax balancing (`tax = gross - base`).
- Added full unit test suite `tests/unit/money.test.ts` (23 tests passing) validating exact precision, Indian comma parsing (`1,23,456.78`), 10,000-iteration accumulation drift, GST back-calculations, and INR formatting.
- Authored ADR 0002 (`docs/adr/0002-money-decimal-representation.md`) documenting money representation, rounding rules, and the P1-T2 migration roadmap (`Float -> Decimal(14,2)`).
## 2026-10-11 — Phase 0 Completion: P0-T3, P0-T4, P0-T5 (merged into dev via PR #12)
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
