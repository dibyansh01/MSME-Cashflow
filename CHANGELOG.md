# Changelog
## [v0-prototype] - 2026-10-10
### Added
- Baseline snapshot: exported synthetic database fixtures (`docs/fixtures/baseline-seed.json`, `docs/fixtures/baseline-seed.sql`) containing 10 prototype models.
- Agent operating pack (`AGENTS.md`, `.agent/workflows`, `.agent/rules`, `.agent/skills`).
- Comprehensive development plan, architecture guides, and compliance rules in `docs/`.

### Verified
- `npm run build` passes cleanly with Next.js 16.1.4 and React 19.
- Clean single-tenant baseline covering receivables tracking, follow-ups, payments, payables queue, expenses, and basic GST metrics.
