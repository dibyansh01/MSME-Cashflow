# Target Data Model & ER Architecture

> **Derived from `docs/DEVELOPMENT_PLAN.md` Part B3.**

## Core Entities
1. **Organization:** Multi-tenant root entity (`id`, `name`, `gstin`, `timezone`).
2. **Membership:** User-to-organization join table with role assignment (`OWNER`, `ACCOUNTS`, `SALES`, `COLLECTOR`, `VIEWER`).
3. **Customer:** B2B buyers with credit limit, GSTIN, segment, and assigned collector.
4. **Vendor:** Suppliers with GSTIN, Udyam number, MSME category, and agreement flags.
5. **Invoice:** Sales invoices with Decimal money amounts and computed status.
6. **Receipt & ReceiptAllocation:** Cash receipts allocated across multiple invoices.
7. **Promise:** Customer commitment to pay by a specified date.
8. **Commitment:** Fixed outflows for salary, rent, EMI, and tax.
9. **WeeklyPlan:** Persisted weekly cash outlook snapshots.
