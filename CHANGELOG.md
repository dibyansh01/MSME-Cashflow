# Changelog
## [Unreleased]
### Added
- **P1-T1 Money Helpers & Decimal Migration Plan**:
  - Implemented canonical money module (`lib/money.ts`) utilizing `Prisma.Decimal` (zero new dependencies).
  - Enforced banking-grade financial rounding and reconciliation: unrounded intermediate calculations, statutory round-half-up (`roundHalfUp2`) per Section 170 CGST Act, banker's round-half-to-even (`roundBankers2`), zero-loss multi-part allocation (`allocate`), and residual tax balancing.
  - Added robust parser supporting Indian comma numbering (`1,23,456.78`), currency symbols, leading decimals (`.50`), and parenthetical accounting formats (`(1,23,456.78)`), with strict rejection of embedded hyphens and dates.
  - Authored ADR 0002 (`docs/adr/0002-money-decimal-representation.md`) detailing money representation, rounding rules, and the P1-T2 migration roadmap (`Float -> Decimal(14,2)`).
  - Added unit test suite in `tests/unit/money.test.ts` (26 tests passing) validating exact precision, Indian rounding, zero-loss proration, 10,000-iteration drift resistance, and INR formatting.

- **P0-T5 Docs Skeleton**:
  - Scaffolded full documentation tree (`docs/architecture/`, `docs/domain/`, `docs/adr/`, `docs/api/`, `docs/user-guide/`, `docs/runbooks/`).
  - Added canonical domain glossary in `docs/domain/glossary.md` enforcing standard terminology.
  - Added standard ADR template in `docs/adr/template.md`.

- **P0-T4 Hygiene & Production Safety**:
  - Removed unconditional `log: ['query']` from `lib/db/prisma.ts` with dev-only opt-in (`LOG_QUERIES=true`).
  - Added structured logger in `lib/logger.ts` with log levels, ISO timestamps, and automatic PII sanitization.
  - Added production guard to `prisma/seed.ts` preventing accidental execution when `NODE_ENV=production`.
  - Moved plaintext demo credentials from `README.md` to `docs/dev-setup.md`.
  - Replaced legacy `db push` references in documentation with `prisma migrate dev`.

- **P0-T3 Port Verification Scripts to Tests**:
  - Converted all 5 ad-hoc scripts in `scripts/` into pure Vitest unit tests under `tests/unit/` (`gst-calculation.test.ts`, `invoice-validation.test.ts`, `gst-kpis.test.ts`).
  - Deleted legacy `scripts/` directory.

- **P0-T2 Tooling & CI foundation**:
  - Vitest test runner configuration (`vitest.config.mts`) with TypeScript `@/*` path alias resolution.
  - Unit tests for environment variable validation (`tests/unit/env.test.ts`) and runner smoke tests (`tests/unit/smoke.test.ts`).
  - Runtime environment schema validation using Zod (`lib/env.ts`) and template (`.env.example`).
  - Code formatting configuration (`.prettierrc`, `.prettierignore`) and `format:check` npm script.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`) enforcing typecheck, lint, formatting, test, and build.
  - Architecture decision record in `docs/adr/0000-tooling-dependencies.md`.

## [v0-prototype] - 2026-10-10
### Added
- Baseline snapshot: exported synthetic database fixtures (`docs/fixtures/baseline-seed.json`, `docs/fixtures/baseline-seed.sql`) containing 10 prototype models.
- Agent operating pack (`AGENTS.md`, `.agent/workflows`, `.agent/rules`, `.agent/skills`).
- Comprehensive development plan, architecture guides, and compliance rules in `docs/`.

### Verified
- `npm run build` passes cleanly with Next.js 16.1.4 and React 19.
- Clean single-tenant baseline covering receivables tracking, follow-ups, payments, payables queue, expenses, and basic GST metrics.
