---
name: domain-testing
description: Use when writing tests for receivables, payables, forecast, insights or import logic.
---
# Domain testing
- Test pure functions in `lib/domain/**` with Vitest; hand-compute expected values in the test and show the arithmetic in a comment.
- Always include: zero amounts, part payments, on-account receipts, credit notes, TDS/short-pay adjustments, exact-boundary dates (due today, 45th/180th day), month-end and leap-day dates, IST vs UTC date edges, empty data, a single sample (fallback lag), and very large invoice counts.
- Use fixtures in `tests/fixtures/` (anonymised only). Never use real customer names.
- Property check where useful: allocations never exceed receipt amount; outstanding never negative without a credit note.
- A bug fix starts with a failing regression test.
