---
name: money-and-tenancy
description: Use when writing or changing any code that handles money amounts, GST math, balances, or reads/writes database records. Enforces Decimal arithmetic and tenant-scoped data access.
---
# Money and tenancy rules
**Money**
- Import helpers from `lib/money.ts` (`d`, `add`, `sub`, `mul`, `pct`, `roundHalfUp2`, `formatINR`). Never use `+ - * /` on currency values typed `number`.
- Round half-up to 2 decimals only where the spec says (GST computation, display). Keep intermediate values exact.
- DB columns are `Decimal(14,2)`. Parse imported strings like `1,23,456.78` through the shared parser; never `parseFloat`.

**Tenancy**
- Get the org from the session (`requireOrg()`), never from request input.
- Use the tenant-scoped client from `lib/db/tenant.ts` (`withTenant(orgId, fn)`). Raw prisma is allowed only inside `lib/db/`.
- Every unique constraint and index includes `organizationId`.
- Any new data-access function must come with a cross-tenant test (Org A cannot read/write Org B).

**Audit**
- Money mutations call `writeAudit(tx, …)` inside the same transaction.
