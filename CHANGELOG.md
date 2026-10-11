# Changelog
## [Unreleased]
### Added
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
