# 0002. Money Decimal Representation, Rounding Standards & Migration Roadmap

- **Date:** 2026-10-11
- **Status:** Accepted
- **Task:** P1-T1 (`lib/money.ts` + Decimal migration plan)

## Context
In the early prototype, monetary amounts were represented as IEEE-754 `Float` columns in Prisma/PostgreSQL and manipulated using standard JavaScript `number` arithmetic (`+`, `-`, `*`, `/`, `parseFloat`).

Financial accounting and Indian statutory compliance (GST Rule 46, Section 170 CGST Act, MSMED Act) require exact precision without binary floating-point drift (e.g. `0.1 + 0.2 === 0.30000000000000004`). In financing, repeated rounding of intermediate values or naive half-up rounding over high transaction volumes causes statistical accumulation bias and "penny leakage" (where the sum of invoice items, tax components, or allocated payments does not equal the total).

## Decision

### 1. Canonical Decimal Representation
- **In-Memory & Domain Logic:** All currency calculations must use `lib/money.ts` wrapping `Prisma.Decimal` (backed by the arbitrary-precision `decimal.js` library bundled with `@prisma/client`).
- **Database Schema (Target in P1-T2):** All money columns will be typed as `Decimal(14,2)` in PostgreSQL, supporting up to ₹999,999,999,999.99 (₹99,999 crore), covering Indian MSME requirements through large corporate trade volumes with 2 decimal places (paise).

### 2. Banking & Financial Rounding Standards
To address financing risks and banking-grade reconciliation:
1. **Unrounded Intermediate Math:** Functions `add`, `sub`, `mul`, `div`, and `pct` in `lib/money.ts` maintain full decimal precision. Intermediate values must never be prematurely rounded to 2 decimal places.
2. **Indian Statutory & Commercial Rounding (`roundHalfUp2`):** Per Section 170 of the CGST Act and commercial practice, invoice totals and line-item taxes round half-up at 2 decimal places (`ROUND_HALF_UP`).
3. **Banker's Rounding (`roundBankers2` / `roundHalfEven2`):** Implements IEEE 754 / ISO round-half-to-even (`ROUND_HALF_EVEN`) for financing calculations and portfolio aggregations to eliminate positive statistical bias.
4. **Zero-Loss Apportionment (`allocate`):** Multi-part distributions (e.g. apportioning payments across invoices or allocating discounts) use the largest-remainder method (Meyer's algorithm). This guarantees that `sum(allocated_parts) === total` down to the exact paisa with zero penny leakage.
5. **Residual Balancing for Inclusive Taxes:** When computing base amounts from tax-inclusive totals, tax is calculated as `tax = gross - base` rather than independently rounding tax and base, ensuring exact arithmetic balance.

### 3. Roadmap for P1-T2 Schema Migration ([HUMAN GATE])
The migration of database columns from `Float` to `Decimal(14,2)` in task P1-T2 will execute under strict human gate approval using the following phased procedure:
1. **Verification on Baseline Seed:** Test the migration SQL on a clone of `tests/fixtures/baseline-seed.sql` before touching any development database.
2. **Column Migration:**
   - Migrate fields: `Invoice.invoiceAmount`, `Invoice.gstAmount`, `Invoice.amount`, `Invoice.paidAmount`, `VendorBill` / `PaymentEntry` / `Expense` monetary columns.
   - For existing columns, apply PostgreSQL type casts: `ALTER TABLE "Invoice" ALTER COLUMN "amount" TYPE DECIMAL(14,2) USING "amount"::numeric(14,2);`.
3. **Application Refactoring:** Replace all occurrences of `parseFloat` and JavaScript operators in services and UI actions with domain functions from `lib/money.ts`.

## Alternatives Considered
- **Integer Paise (Cents):** Storing values as integer paise (e.g. 100 paise = ₹1). While common in simple payment gateways, it complicates GST tax calculations (where 18% on ₹1,234.56 produces 222.2208 before rounding) and requires manual scaling throughout services.
- **JavaScript `number` / `Float`:** Rejected outright due to IEEE-754 precision drift and rounding errors unacceptable in financial applications.
- **External Library (`dinero.js`, `bignumber.js`):** Rejected because `@prisma/client` already ships with `decimal.js` as `Prisma.Decimal`. Reusing it introduces zero new dependencies.

## Consequences
- **Positive:** Guaranteed zero penny drift, deterministic financial math, compliance with Indian GST rules, and banking-grade balance reconciliation.
- **Constraints:** Developers must strictly use `lib/money.ts` helpers. Direct use of `+`, `-`, `*`, `/` or `parseFloat` on monetary amounts is prohibited.
