# DEVELOPMENT_PLAN.md — MSME CashFlow

*For humans and coding agents. Derived from the strategy report (2 Oct 2026) and the current README. Read `AGENTS.md` first.*

**Goal of this plan:** turn the current single-tenant prototype into a **sellable, multi-tenant "Weekly Cash Plan" product** with the smallest possible rewrite, reusing the existing logic wherever it is correct.

**Product wedge (what everything below serves):** import data from Tally/Excel → learn how each customer pays → 13-week cash outlook → payables with legal clocks (43B(h), 180-day ITC) → one-page **Weekly Cash Plan** → WhatsApp-driven collections.

> **Reality check before heavy build:** run the customer validation in the strategy report (Section 19) **in parallel** with Phases 0–2. Phases 0–2 (foundation) are needed regardless of outcome; Phases 3+ should be shaped by what pilots show. Do not skip validation.

---

## PART A — What to KEEP / REMOVE / ADD / CORRECT

### A1. KEEP (reuse as-is or with light refactor)

| Existing | Where | Why keep | Light changes needed |
|---|---|---|---|
| Next.js 16 + React 19 + Prisma + Postgres + Tailwind + NextAuth | stack | Fine for a small team | Upgrade only when needed |
| Aging buckets | `lib/utils/aging.ts` | Correct concept | Move to `lib/domain/receivables/aging.ts`; use Decimal; compute at read time; add tests |
| WhatsApp message templates (3 tiers, Hindi closure) | `lib/collections/messageTemplates.ts` | Culturally right, tested idea | Convert to a template registry (key, language, variables) so it maps onto official WhatsApp templates; add Hindi/Hinglish variants |
| WhatsApp action buttons / copy button | `components/WhatsAppActions.tsx`, `components/copyButton.tsx` | Keep as *fallback* when API send isn't configured | Route through the messaging service later |
| Follow-up queue UX (call/WhatsApp/visit × promised/no response/paid/disputed) | `app/followups`, `invoices/[id]/followup` | Core workflow | Re-base on customer-level **Promise** (see B3) |
| Customer risk idea (HIGH/MED/LOW) | `lib/analytics/customerRisk.ts` | Good as a v0 flag | Move to domain; thresholds configurable per org; later fed by lag metrics |
| Invoice math (GST inclusive/exclusive) | `lib/utils/invoice.ts` + `scripts/verify-gst-calculation.ts` | Correct arithmetic | Rewrite on Decimal; convert verify scripts into Vitest tests |
| Dashboard service | `lib/services/dashboardService.ts` | Good aggregation skeleton | Tenant-scope; fix Net Cash and forecast logic; split into smaller queries |
| Payables queue (overdue / due in 7 days) | `app/payables-queue` | Good concept | Add legal clocks; ranking; "pay/hold" recommendation |
| Payment settlement transaction pattern | `app/invoices/[id]/payment/actions.ts` | Atomic update is right | Replace with receipt+allocation model, same transactional pattern |
| Export engine (Excel/PDF, filter-aware, row cap) | `app/api/export` | Useful for CAs | Add per-entity permission checks, streaming; reuse for Weekly Plan PDF styling |
| UI primitives, layout, sidebar, theme | `app/components/ui`, `components/AppLayout.tsx`, `Sidebar.tsx` | Reuse everywhere | Simplify nav (see A2) |
| RBAC concept (OWNER/ACCOUNTS/SALES) | `lib/authOptions.ts` | Right personas | Move to permission map; add `COLLECTOR` scope (assigned customers only) |
| Seed generator | `prisma/seed.ts` | Great for demos/tests | Make tenant-aware; keep out of production |
| Verification scripts | `scripts/*.ts` | Existing test intent | Port to Vitest, delete the scripts |

### A2. REMOVE or DE-EMPHASISE

| Item | Action | Reason |
|---|---|---|
| `log: ['query']` in `lib/db/prisma.ts` | **Remove** | PII in logs, slow in prod |
| Demo credentials in README and production seed | **Remove from prod**; keep in dev only | Security |
| `prisma db push` in setup docs | **Replace** with `migrate` | Safe schema changes |
| GST rate-mix donut (`GstRateMix`) | **Remove** | Decorative; CAs/Tally cover it |
| GST trend chart as a top-level page | **Fold** into a small "GST" panel or remove; don't invest | Low value to the wedge |
| `/gst-analytics` "Leakage audit" as a major module | **Demote** to one insight rule ("₹X non-claimable GST this quarter") | Rare, small ₹ |
| "GST Credit Pending / ITC unlocked on vendor payment" metric | **Remove and replace** with the 180-day ITC clock | Legally incorrect framing |
| `Expense` as full cost-accounting (categories, per-vendor expense) | **Replace** with `Commitment` (recurring/one-off known outflows for forecasting) | Avoid accounting scope; needed only for forecast |
| PDF export of every list | Keep Excel for all; PDF only for Weekly Plan and exposure reports | Less surface, less maintenance |
| Stored `OVERDUE` status | **Remove** (compute at read time) | Drifts without a scheduler |
| "Predictive" wording in UI/README | **Remove** until the lag model exists | Honest claims |
| Manual-only invoice creation as the primary path | **Demote** to "add one-off"; import becomes primary | Re-keying kills adoption |

### A3. CORRECT (bugs and wrong logic in the current design)

| # | Problem | Correction |
|---|---|---|
| C1 | `Float` money | `Decimal(14,2)` everywhere, `lib/money.ts` helper |
| C2 | No tenant key | `organizationId` on every table, tenant-scoped client, RLS |
| C3 | Forecast excludes overdue receivables and assumes on-time payment | Include overdue; expected date = due + customer median lag (see spec D4) |
| C4 | "Net Cash Position" = receipts − payments (not bankable) | Replace with `BankBalanceSnapshot` + forecast; label old metric "Net cash movement" |
| C5 | ITC logic | Replace with ITC 180-day clock + proportional reversal exposure; add GSTR-2B caveat (see compliance doc) |
| C6 | "GST cash blocked" overstated | Show **net cash GST attributable to uncollected invoices** = max(0, output − available ITC) × uncollected share |
| C7 | Follow-ups per invoice, no owner/amount | `Promise` at customer level with amount, date, assigned collector |
| C8 | No credit limit | Add `Customer.creditLimit`; alert on breach |
| C9 | No on-account/advance receipts, deductions, credit notes | `Receipt` + `ReceiptAllocation`, `Adjustment` (TDS, discount, short-pay, write-off), `CreditNote` |
| C10 | Export RBAC | Enforce permission per entity inside the export route |
| C11 | Audit only on payments | Append-only `AuditLog` on all money tables |
| C12 | `vendors` lack MSE/Udyam data | Add `udyamNumber`, `msmeCategory` (MICRO/SMALL/MEDIUM/NONE/UNKNOWN), `coveredBy43Bh` (nullable bool, CA-confirmable), `hasWrittenAgreement`, `agreedCreditDays` |
| C13 | Parties lack GSTIN | Add `gstin` (validated format) to Customer and Vendor |

### A4. ADD (new capabilities, in build order)

1. Test infrastructure, CI, structured logging, env validation, error tracking
2. Multi-tenancy (Organization, Membership, tenant client, RLS) + permission map + audit log
3. Domain layer (`lib/domain/*`) with unit tests
4. Data-model upgrades (receipts/allocations, promises, adjustments, party fields, commitments, bank balance)
5. Import pipeline (CSV/Excel from Tally/Busy exports) with staging, mapping, preview, rollback
6. Behaviour engine (per-customer payment lag, promise reliability)
7. Forecast v1 (13 weeks, P50 + conservative)
8. Obligation clocks (43B(h), 180-day ITC) + year-end exposure report
9. Insight rules engine (5 rules to start) + daily cap
10. **Weekly Cash Plan** generator (PDF + WhatsApp link) and job scheduler
11. Official WhatsApp send/receive abstraction with delivery status and opt-in log
12. Billing, onboarding, backups, monitoring, user docs

---

## PART B — Target architecture (minimal, evolutionary)

### B1. Folder structure (target)

```
app/                         # routes (thin): pages, server actions, route handlers
components/                  # shared components (existing + new)
lib/
  money.ts                   # Decimal helpers (add, sub, mul, round, format INR)
  dates.ts                   # IST helpers, business logic dates
  logger.ts                  # structured logging
  env.ts                     # zod-validated environment
  db/
    prisma.ts                # raw client (restricted use)
    tenant.ts                # tenant-scoped client + withTenant(orgId, fn)
  auth/
    authOptions.ts           # moved from lib/authOptions.ts
    permissions.ts           # role → permission map; can(user, "invoice:create")
    session.ts               # getSessionOrThrow(), requireOrg()
  domain/                    # PURE logic, no I/O, fully unit-tested
    receivables/             # aging, allocation, outstanding, lag metrics
    payables/                # obligations (43B(h), ITC clock), prioritisation
    cashflow/                # forecast, commitments, plan builder
    insights/                # rules engine
    gst/                     # invoice math (moved from utils/invoice.ts)
  services/                  # I/O orchestration using domain + db (existing services live here)
  imports/                   # parsers, mappers, validators, commit/rollback
  messaging/                 # provider interface, templates registry, webhook handlers
  jobs/                      # scheduled jobs (weekly plan, daily insights, status refresh)
  audit.ts                   # writeAudit(tx, ...)
docs/
  DEVELOPMENT_PLAN.md
  architecture/ data-model.md, tenancy.md, jobs.md
  domain/ compliance-rules.md, forecast.md, insights.md, glossary.md
  adr/ 0001-... .md
  api/ , user-guide/ , runbooks/
tests/                       # unit/ integration/ e2e/ fixtures/
prisma/ schema.prisma, migrations/, seed.ts
```

*Do the move incrementally: each PR relocates only what it touches. Keep re-export shims for one release if many imports break, then delete.*

### B2. Core design decisions (record each as an ADR)

| ADR | Decision |
|---|---|
| 0001 | **Tenancy:** shared database, `organizationId` column on every table, Postgres Row-Level Security as defence-in-depth, tenant-scoped Prisma helper as primary control |
| 0002 | **Money:** `Decimal(14,2)` in DB, `Prisma.Decimal`/`decimal.js` in code, round half-up to 2 places at defined points only |
| 0003 | **Overdue is computed**, never stored |
| 0004 | **Ledger shape:** receipts allocated to invoices through allocation rows (m:n); credit notes and adjustments are first-class |
| 0005 | **Import first:** data enters through an import pipeline; manual entry is a fallback |
| 0006 | **Jobs:** use a Postgres-backed queue/scheduler (choose one, e.g. pg-boss) rather than adding Redis at this stage |
| 0007 | **Messaging:** provider-agnostic interface; official WhatsApp Business Platform via a BSP; deep links remain a fallback |
| 0008 | **AI:** LLMs only for mapping, parsing replies, drafting text, narration — never for computing numbers |
| 0009 | **Compliance rules** are data-versioned in `docs/domain/compliance-rules.md` and a typed config, with CA sign-off status |

### B3. Target data model (additions/changes to the current Prisma schema)

*Keep existing models; evolve them. Sketch below is guidance — the Claude agent finalises it in P1-T4 under a **[HUMAN GATE]**.*

```prisma
model Organization { id String @id @default(cuid()) name String gstin String? timezone String @default("Asia/Kolkata") createdAt DateTime @default(now()) }
model Membership   { id String @id @default(cuid()) organizationId String userId String role Role @@unique([organizationId, userId]) }
enum Role { OWNER ACCOUNTS SALES COLLECTOR VIEWER }

// Every existing model gains: organizationId String + @@index([organizationId])

model Customer {
  // existing fields +
  gstin String?
  creditLimit Decimal? @db.Decimal(14,2)
  segment String?              // e.g., dealer, OEM, retail
  assignedCollectorId String?
}

model Invoice {                // money fields -> Decimal
  // existing +
  source ImportSource @default(MANUAL)
  externalRef String?          // Tally voucher/bill ref for idempotent import
  importBatchId String?
  // remove: status stored OVERDUE (compute). Keep PAID/PARTIAL/UNPAID derived or via view.
}

model Receipt { id String @id organizationId String customerId String amount Decimal receivedOn DateTime mode PayMode reference String? notes String? createdById String }
model ReceiptAllocation { id String @id receiptId String invoiceId String? amount Decimal @@index([invoiceId]) }  // invoiceId null = on-account
model Adjustment { id String @id invoiceId String type AdjType amount Decimal reason String? }  // TDS, DISCOUNT, SHORT_PAY, WRITE_OFF
model CreditNote { id String @id customerId String invoiceId String? amount Decimal issuedOn DateTime }

model Promise { id String @id organizationId String customerId String amount Decimal promisedFor DateTime
  status PromiseStatus  // OPEN, KEPT, PARTIAL, BROKEN, CANCELLED
  madeVia FollowUpMethod assignedToId String? sourceFollowUpId String? createdAt DateTime @default(now()) }

model Vendor { /* existing + */ gstin String? udyamNumber String? msmeCategory MsmeCategory @default(UNKNOWN)
  hasWrittenAgreement Boolean @default(false) agreedCreditDays Int? coveredBy43Bh Boolean? }
model VendorInvoice { /* existing + */ acceptanceDate DateTime? itcAvailedOn DateTime? source ImportSource externalRef String? }

model Commitment { id String @id organizationId String label String amount Decimal frequency Frequency nextDueOn DateTime kind CommitmentKind } // SALARY, RENT, EMI, GST, TDS, OTHER
model BankBalanceSnapshot { id String @id organizationId String asOf DateTime balance Decimal accountLabel String? }

model ImportBatch { id String @id organizationId String kind ImportKind fileName String status ImportStatus rowsTotal Int rowsOk Int rowsRejected Int createdById String createdAt DateTime @default(now()) rolledBackAt DateTime? }
model ImportRowError { id String @id batchId String rowNo Int message String raw Json }

model AuditLog { id String @id organizationId String actorId String entity String entityId String action String before Json? after Json? at DateTime @default(now()) }
model MessageLog { id String @id organizationId String customerId String? channel String templateKey String status MessageStatus providerMsgId String? sentAt DateTime? deliveredAt DateTime? readAt DateTime? error String? }
model WeeklyPlan { id String @id organizationId String weekStart DateTime payload Json pdfPath String? createdAt DateTime @default(now()) }
model Insight { id String @id organizationId String type String severity String amountImpact Decimal? evidence Json action String? ownerId String? dueOn DateTime? status String createdAt DateTime @default(now()) }
```

**Migration safety rules:** add columns nullable → backfill → set NOT NULL; never drop in the same release you add the replacement; take a DB snapshot before each migration; test the migration on a copy of the seeded DB.

---

## PART C — Phased task cards (agents work through these in order)

**Conventions.** `[CL]` = suggested Claude agent, `[GM]` = suggested Gemini agent, `[HUMAN GATE]` = stop for approval before merging. Each card: Goal → Reuse → Steps → Acceptance → Docs. Don't start a phase until the previous phase's **Exit criteria** are met.

### PHASE 0 — Baseline and safety (≈ 2–3 days)

**P0-T1 [CL] Baseline snapshot.** Tag current `main` as `v0-prototype`. Export a seeded DB dump to `docs/fixtures/` (no real data). Confirm `npm run build` passes. *Docs:* note current state in `CHANGELOG.md`.

**P0-T2 [CL] Tooling.** Add Vitest, ESLint/Prettier config check, `typecheck` script, GitHub Actions (typecheck, lint, test, build). Add `lib/env.ts` (zod) and `.env.example`. *Acceptance:* CI green on an empty PR.

**P0-T3 [CL] Port verification scripts to tests.** Convert every file in `scripts/` into Vitest tests under `tests/unit/` (GST math, KPIs, invoice math, constraints). Keep behaviour identical; delete scripts after parity. *Acceptance:* same assertions, now run in CI.

**P0-T4 [CL] Hygiene.** Remove `log: ['query']` from `lib/db/prisma.ts` (dev-only opt-in via env). Add `lib/logger.ts`. Remove demo credentials from README (move to `docs/dev-setup.md`, dev only). Make `prisma/seed.ts` refuse to run when `NODE_ENV=production`. Switch docs from `db push` to `prisma migrate` (create the initial baseline migration from the current schema). **[HUMAN GATE]** for the baseline migration.

**P0-T5 [GM] Docs skeleton.** Create the `docs/` tree from B1, a glossary (`docs/domain/glossary.md`), and ADR template. *Acceptance:* every folder has an index file.

**Exit criteria:** CI green, no scripts left, baseline migration committed, no query logging, docs skeleton exists.

---

### PHASE 1 — Foundation: money, tenancy, auth, audit (≈ 2–3 weeks)

**P1-T1 [CL] `lib/money.ts` + Decimal migration plan.** Implement helpers (`d()`, `add`, `sub`, `mul`, `pct`, `roundHalfUp2`, `formatINR`). Write ADR 0002. Unit-test rounding (e.g., 18% GST on ₹1,234.56; inclusive back-calculation; sums of 10,000 small amounts equal expected exactly).

**P1-T2 [CL] Move money columns to Decimal.** Migration: `Float → Decimal(14,2)` for every money field (`invoiceAmount, gstAmount, amount, paidAmount`, vendor and expense equivalents). Update all code using money to the helpers. *Reuse:* `lib/utils/invoice.ts` formulas (rewrite arithmetic only). **[HUMAN GATE]** — review migration on a copy of the seeded DB first.

**P1-T3 [CL] Tenancy foundation.** Add `Organization`, `Membership`; add nullable `organizationId` to every table; backfill all existing rows into one "Default Org"; then NOT NULL + indexes. Implement `lib/db/tenant.ts` (Prisma client extension that injects `organizationId` into every `where`/`data`; `withTenant(orgId, fn)` sets `SET LOCAL app.current_org`). Add RLS policies on core tables as a second layer. Session carries `orgId` + `role`. Write ADR 0001 and `docs/architecture/tenancy.md`. **[HUMAN GATE]**.

**P1-T4 [CL] Tenant migration of all data access.** Replace raw `prisma` imports in `app/**`, `lib/services/**`, `app/api/**` with the tenant client. A lint rule or grep check in CI fails if raw prisma is imported outside `lib/db/`. *Acceptance:* **cross-tenant tests**: create Org A and Org B with data; every list/detail/export/action for A returns zero B rows and cannot mutate B ids (test at least: customers, invoices, receipts, vendors, export, dashboard).

**P1-T5 [CL] Permissions.** `lib/auth/permissions.ts`: map `role → permissions` (e.g., `invoice:create`, `receipt:record`, `vendor:view`, `export:customers`, `plan:view`, `settings:manage`). Replace page-level checks with `requirePermission()` in every server action and route handler (including export per entity). Add `COLLECTOR` role scoped to assigned customers. *Acceptance:* permission matrix test table; SALES cannot export vendors/expenses.

**P1-T6 [CL] Audit log.** `AuditLog` model + `writeAudit(tx, …)` called inside every money-affecting mutation transaction (invoice create/edit/delete, receipt, allocation, adjustment, vendor payment). Provide a read-only audit view for OWNER. *Acceptance:* tests assert a row per mutation with before/after.

**P1-T7 [CL] Auth hardening.** Rate-limit login; secure cookies; password reset flow; optional TOTP MFA for OWNER; invite-user flow (OWNER invites by email/phone, picks role). **[HUMAN GATE]**.

**P1-T8 [GM] Onboarding shell.** Sign-up → create organization → invite users → empty-state screens that point to "Import your Tally data". Reuse `AppLayout`, `ui` primitives.

**Exit criteria:** all money Decimal; two seeded orgs isolated by tests; audit log live; permissions enforced server-side; docs updated (tenancy, data-model, ADRs 0001–0003).

---

### PHASE 2 — Domain correctness (≈ 2 weeks)

**P2-T1 [CL] Domain layer extraction.** Create `lib/domain/receivables`, `payables`, `cashflow`, `gst`. Move pure logic out of services/pages: aging (from `utils/aging.ts`), invoice math, risk. Services call domain functions. Tests for each. *Rule:* no Prisma imports in `lib/domain/**` (enforce with lint).

**P2-T2 [CL] Ledger upgrade.** Add `Receipt`, `ReceiptAllocation`, `Adjustment`, `CreditNote`; migrate existing `PaymentEntry` rows into Receipt + one allocation each; keep `PaymentEntry` deprecated for one release then delete. Outstanding = invoice total − allocations − adjustments − credit notes (spec D3). Support: part-payment, on-account/advance receipts, TDS/discount/short-pay/write-off. Update the payment UI (`invoices/[id]/payment`) to the receipt flow with multi-invoice allocation. **[HUMAN GATE]**.

**P2-T3 [CL] Computed status.** Remove stored OVERDUE; derive status in domain (`UNPAID | PARTIAL | PAID | OVERDUE | WRITTEN_OFF`). Update filters/KPIs.

**P2-T4 [CL] Party fields.** Add `gstin` (format-validated), `creditLimit`, `segment`, `assignedCollectorId` to Customer; add Udyam/MSE/agreement fields to Vendor (C12/C13). Forms updated, with plain-language hints ("Udyam number: from the vendor's Udyam certificate").

**P2-T5 [CL] Promise-to-pay.** Add `Promise`; link FollowUps to customers (optionally invoices). New UI: log a promise (amount, date, assignee). Promise status auto-evaluates (KEPT/BROKEN) by comparing receipts after the promised date. Update customer risk to use broken-promise ratio. *Reuse:* the existing follow-up queue UI.

**P2-T6 [CL] Fix existing metrics.** Replace "GST Credit Pending" with the 180-day ITC clock (spec D5); fix "GST cash blocked" (C6); rename "Net Cash Position" → "Net cash movement" until Phase 4; remove GST rate-mix and demote leakage (A2). Update `docs/domain/*.md` with worked numeric examples.

**P2-T7 [GM] UI updates** for P2-T2/T4/T5 using existing components; Hindi labels for key fields.

**Exit criteria:** books reconcile on seeded data after every operation (property-style test: sum of allocations never exceeds receipts; outstanding never negative without credit note); no stored overdue; metrics corrected; docs current.

---

### PHASE 3 — Import pipeline (≈ 2–3 weeks) — **the adoption unlock**

**Before coding [HUMAN]:** collect **5 real Tally/Busy exports** (with permission, anonymised) for fixtures: outstanding receivables, outstanding payables, party master, day book. Put anonymised samples in `tests/fixtures/imports/`. *The importer must be built against real mess, not imagined files.*

**P3-T1 [CL] Import framework.** `ImportBatch`, `ImportRowError`, staging tables. Flow: upload → detect type → **column mapping** (remember mappings per org) → validate → **preview with counts and errors** → commit in one transaction → **rollback by batch**. Idempotency via `(organizationId, kind, externalRef)`. Write ADR 0005 and `docs/architecture/imports.md`.

**P3-T2 [CL] Parsers.** Excel/CSV via the existing ExcelJS (reuse); support Tally "Bills Receivable/Payable" and "Party ledger" export layouts, Indian number formats (`1,23,456.78`), Dr/Cr suffixes, dd-mm-yyyy dates, merged header rows. One parser per kind, each with fixtures and tests.

**P3-T3 [CL] Party matching.** Match imported names to existing parties (exact → normalised → fuzzy suggestions). Never auto-merge on fuzzy; show a review list.

**P3-T4 [GM] Import UI.** Stepper: upload → map → preview → confirm → result with downloadable error file. Empty states for new orgs. Reuse `ui` primitives.

**P3-T5 [CL] LLM-assisted mapping (optional, behind flag).** Suggest column mappings from headers/sample rows; human confirms; log prompts without PII beyond sample headers. Skip if mapping heuristics suffice.

**Exit criteria:** an unfamiliar Tally outstanding export imports in < 5 minutes, balances reconcile to the export's totals, and rollback leaves no residue.

---

### PHASE 4 — Cash engine (≈ 3–4 weeks)

**P4-T1 [CL] Opening/bank balance + commitments.** `BankBalanceSnapshot`, `Commitment` models; simple UI (enter bank balance; add salary/rent/EMI/GST/TDS recurring items). Replace Expense module's role (A2): keep expense data for history but hide cost-accounting views.

**P4-T2 [CL] Behaviour metrics (spec D4a).** Per customer: median/P80 days-to-pay beyond due, trend (last 3 vs previous 6), promise reliability, sample size. Store in a derived table refreshed by job. Tests with synthetic histories.

**P4-T3 [CL] Forecast v1 (spec D4).** 13 weekly buckets: opening balance + expected receipts − vendor payments − commitments. Expected-receipt date logic with overdue included and fallbacks. Output P50 and "conservative" series. Pure function in `lib/domain/cashflow/forecast.ts`; service wires data. Golden tests with hand-computed examples. *Reuse:* the existing cash-flow page charts (Recharts).

**P4-T4 [CL] Obligation clocks (spec D5).** Compute for each vendor invoice: 43B(h) deadline status and 180-day ITC date. Surfaces: payables queue badges, "At risk" list, and **Year-end exposure report** (Excel/PDF, as-of any date). Wording from `docs/domain/compliance-rules.md` only. **[HUMAN GATE]** — CA must review text before release.

**P4-T5 [CL] Prioritisation (spec D5b).** Rank payables: legal-clock urgency, amount, supplier type, owner-set "critical vendor" flag; produce `PAY_NOW / PAY_BY / CAN_HOLD` recommendations given forecast shortfall. Deterministic, explainable.

**P4-T6 [CL] Insight rules (spec D6).** Implement 5 rules; daily cap; dedupe; store as `Insight` with status (new/acknowledged/done).

**P4-T7 [CL] Weekly Cash Plan (spec D7).** Builder in `lib/domain/cashflow/plan.ts`; PDF renderer (reuse jsPDF styling from export); `WeeklyPlan` archive; Monday job; web view + "share on WhatsApp" link.

**P4-T8 [CL] Job scheduler.** pg-boss (or chosen alternative per ADR 0006): jobs for plan generation, insight refresh, metric refresh, reminder cadence. Retries, idempotency, per-org locks, dashboard of job status. Write `docs/architecture/jobs.md` and a runbook.

**P4-T9 [GM] UI.** Home = "This week" (cash today, 13-week chart, top chases, must-pay list, insights). Simplify navigation per Part E. Mobile-first checks.

**Exit criteria:** forecast beats naive due-date forecast on backtest of pilot/seed history (record the comparison in `docs/domain/forecast.md`); Weekly Cash Plan generated from imported data in < 30 minutes of onboarding.

---

### PHASE 5 — Messaging (≈ 2 weeks; can start earlier in parallel with Phase 3)

**P5-T1 [HUMAN] Set up** a WhatsApp Business Platform account via a BSP, create 3–4 **utility** templates (reminder 1/2/3, promise confirmation) in Hindi + English; get approval. Collect customer opt-in policy text.

**P5-T2 [CL] Messaging abstraction.** `lib/messaging/provider.ts` interface (`send`, `parseWebhook`); `whatsappProvider` + `deepLinkProvider` fallback. Template registry (extend `messageTemplates.ts`). `MessageLog` with delivery/read updates from webhooks (signature-verified). Per-org daily cap; no sending without explicit `messagingEnabled` flag per org. **[HUMAN GATE]** before any real send.

**P5-T3 [CL] Reminder cadence.** Rule-based cadence per customer segment (e.g., due−2, due+3, due+10); owner can pause per customer; every send logged and visible in the customer timeline.

**P5-T4 [CL] Reply capture (basic).** Store inbound replies on the customer timeline; staff can convert a reply to a Promise in one click. (LLM parsing = later, after validation.)

**Exit criteria:** a test org sends and tracks reminders end-to-end; failures are visible; opt-out honoured.

---

### PHASE 6 — Product readiness (≈ 2–3 weeks)

**P6-T1 [CL] Billing.** Subscription plans, trial → paid, UPI autopay or card via chosen gateway, GST invoices for your own sales, plan limits (users, messages). Manual invoicing is acceptable for the first 10 customers — don't over-build. **[HUMAN GATE]**.

**P6-T2 [CL] Operations.** Managed Postgres with point-in-time recovery, **tested restore**, error tracking, uptime checks, structured logs, per-org metrics, staging environment, rollback procedure. Runbooks in `docs/runbooks/`.

**P6-T3 [CL] Security review.** OWASP checklist on auth, server actions, uploads (file type/size, malware scan), export endpoints, webhooks; dependency audit; secrets management; backup encryption; data-retention and delete-on-request process.

**P6-T4 [GM] Docs & help.** Hindi/English quick-start (import → plan → first chase), FAQ, "what the numbers mean", compliance disclaimers, short screen-recorded walkthroughs (human records).

**P6-T5 [CL] Performance.** Seed 50k invoices; ensure dashboard < 2 s and import 20k rows < 2 min; add indexes (`organizationId, customerId, dueDate`), pagination everywhere, avoid N+1.

**P6-T6 [HUMAN] Legal.** Terms, privacy policy, DPA language, data-processing disclosures for WhatsApp; check current DPDP obligations with a lawyer.

**Exit criteria:** the "I can confidently start charging real businesses when…" list from the strategy report (Section 11B) is fully ticked.

---

## PART D — Specifications (agents implement exactly; changes need a human)

### D1. Money
- DB: `Decimal(14,2)`. Code: Decimal type only. Round half-up to 2 places **only** at: line/invoice GST computation and display. Intermediate sums are exact.
- Inclusive GST: `base = round(total / (1 + rate))`, `gst = total − base`. Exclusive: `gst = round(base × rate)`.

### D2. Tenancy rules
- Every table has `organizationId` (non-null) and an index starting with it.
- No endpoint accepts an `organizationId` from the client; it comes from the session.
- Every unique constraint includes `organizationId`.
- Background jobs receive `orgId` explicitly and run inside `withTenant`.

### D3. Receivables
```
invoiceTotal      = invoiceAmount + gstAmount
settled           = Σ allocations(invoice) + Σ adjustments(invoice) + Σ creditNotes(invoice)
outstanding       = invoiceTotal − settled           (never below 0; negative → flag data error)
dueDate           = invoiceDate + creditDays
daysOverdue       = max(0, today − dueDate)  [IST]
status            = PAID if outstanding = 0 | WRITTEN_OFF if adjustment WRITE_OFF clears it
                    | OVERDUE if outstanding > 0 and today > dueDate
                    | PARTIAL if settled > 0 else UNPAID
aging buckets     = 0–30 / 31–60 / 61–90 / 90+ (days overdue), configurable
on-account receipt= allocation with invoiceId = null; auto-apply by oldest-invoice-first only when the user confirms
```
Test cases to include: part payment then credit note; on-account then allocation; TDS deduction clearing a bill; negative outstanding flagged; leap-day/month-end due dates.

### D4. Forecast v1
**Inputs:** bank balance snapshot (latest), open receivables, open payables, commitments, customer behaviour metrics, promises.

**D4a. Customer lag metric:** over the last 12 months, for invoices fully settled, `lag = lastAllocationDate − dueDate` (can be negative = early). Use median and P80. Require ≥ 3 samples, else fallback to the org-wide median for the customer's segment, else a default of +15 days (configurable). Store `sampleSize` and show it in the UI.

**D4b. Expected receipt date for an open invoice:**
1. If an **open Promise** exists covering it and the customer's promise reliability ≥ 60% (≥ 3 promises): use `promisedFor`.
2. Else `expected = max(today, dueDate + medianLag)`.
3. Overdue invoices **are included** (`expected = today + max(medianLag − daysOverdue, 7)`, minimum 7 days out), never dropped.
4. **Conservative series** uses P80 lag instead of median.

**D4c. Weekly buckets:** 13 weeks from the current Monday (IST). Net = receipts − vendor payments − commitments. Running balance starts from the latest bank snapshot (warn if older than 7 days).

**D4d. Vendor payments:** by default at `dueDate` (or earliest of due date and 43B(h)/ITC deadlines when "protect deadlines" is on). Owner may override per bill.

**D4e. Output:** per-week receipts, payments, commitments, closing balance (median and conservative), first week where balance < safety threshold (org setting; default 0), shortfall amount, and the **assumptions list** shown to the user.

**Backtest requirement:** compare against the naive "pay on due date" forecast on seeded/pilot history; record error metrics in `docs/domain/forecast.md`.

### D5. Obligation clocks (rules live in `docs/domain/compliance-rules.md`)
- **43B(h) clock** for vendor invoices where the vendor is MICRO/SMALL **and** `coveredBy43Bh != false`: `agreedDays = hasWrittenAgreement ? min(agreedCreditDays, 45) : 15`; `deadline = acceptanceDate (default invoiceDate) + agreedDays`; states: OK / DUE_SOON (≤ 7 days) / PAST_DEADLINE (unpaid) / PAID_LATE. Show a *note* about the return-due-date nuance; never state tax amounts as certain.
- **ITC 180-day clock:** for ITC-eligible vendor invoices: `reversalDate = invoiceDate + 180`; exposure = proportionate unpaid GST. Show DUE_SOON (≤ 14 days) and PAST_180.
- **D5b. Prioritisation score** (deterministic): `score = clockUrgency (0–50) + amountWeight (0–20) + criticalVendor (0–20) + earlyPayDiscount (0–10)`; list sorted descending; recommendation rules: PAST/DUE_SOON clocks → PAY_NOW if funds exist else flagged; otherwise CAN_HOLD until the earliest of due date or clock.
- Always show *why* (the evidence) next to each recommendation.

### D6. Insight rules (v1; cap 5 visible per day; dedupe by key)
1. **Receivables rising:** overdue total up > 15% vs 30 days ago and > ₹X (org threshold).
2. **Repeat late payer:** customer median lag > 15 days and worsening trend.
3. **Broken promises:** ≥ 2 broken in 60 days → "escalate".
4. **Deadline approaching:** 43B(h)/ITC clocks within 7/14 days with amounts.
5. **Concentration:** top 3 customers > 50% of open receivables.
Each insight: `type, severity, amountImpact, evidence (ids), recommended action, suggested owner, due date`. Rank by `amountImpact × urgency × confidence`.

### D7. Weekly Cash Plan (one page)
Sections: (1) cash today + as-of date; (2) 13-week chart with shortfall week highlighted; (3) **Chase list** — top 10 by `amount × lateness`, owner, last promise; (4) **Pay list** — PAY_NOW / PAY_BY with clock reasons; (5) **Watch list** — top 3 insights; (6) assumptions and data freshness; (7) footer disclaimer. Generated Monday 7:00 IST per org (configurable); archived; shareable link; PDF.

### D8. Import file kinds (v1)
`CUSTOMER_OUTSTANDING`, `VENDOR_OUTSTANDING`, `PARTY_MASTER`, `BANK_BALANCE_CSV`. Required fields and validation rules are documented in `docs/architecture/imports.md` (agent creates in P3-T1) and covered by fixtures.

---

## PART E — Navigation and UX simplification (target)

Home **"This week"** · **Chase** (customers, promises, reminders) · **Pay** (vendors, clocks, plan) · **Cash** (13-week forecast, commitments, bank balance) · **Data** (imports, parties) · **Reports** (exposure report, exports) · **Settings** (users, templates, thresholds). Remove or fold: GST analytics page, expense categories page, separate "Reports" chart pages that don't feed decisions.

---

## PART F — How to run the agents

### F1. Setup after placing files in the repo
1. Put `AGENTS.md` in the root and `DEVELOPMENT_PLAN.md` in `docs/`. Add `docs/domain/compliance-rules.md` (provided) and an empty `CHANGELOG.md`.
2. Commit these on `main` as the first "docs-only" commit; tag `v0-prototype` before any agent edits code.
3. Configure Antigravity workspace rules to include `AGENTS.md` (check where your version reads rules; if it doesn't auto-read, paste the pointer: "Read AGENTS.md and docs/DEVELOPMENT_PLAN.md before any task").
4. Create the GitHub issues/boards from the task IDs (P0-T1…P6-T6).

### F2. Standard prompt for each task (copy/paste)
```
Task: <ID> from docs/DEVELOPMENT_PLAN.md.
1. Read AGENTS.md, the task card, and the referenced specs (Part D).
2. Search the repo for existing code to reuse; list what you will reuse and what you will remove.
3. Post a plan (files, steps, tests, risks). Stop at [HUMAN GATE] items until I approve.
4. Implement on branch feat/<ID>-<slug> with tests and docs per the Definition of Done.
5. Run typecheck, lint, tests. Summarise results, manual verification steps, and anything uncertain.
Do not expand scope. If a spec seems wrong or legally uncertain, stop and ask.
```

### F3. Review prompt (the *other* agent)
```
Review PR <n> against AGENTS.md Definition of Done and the task's acceptance criteria. Check: tenant scoping, permission checks, Decimal money, audit logging, reuse of existing code, dead code removed, tests meaningful (not just snapshots), docs updated, no scope creep. List blocking issues and nice-to-haves separately.
```

### F4. Weekly rhythm
- **Mon:** pick 1–3 tasks; agents plan; you approve gates.
- **Tue–Thu:** agents implement; cross-review.
- **Fri:** you test manually on the seeded + a real anonymised dataset; merge; update `CHANGELOG.md`; run the retro: what to change in `AGENTS.md` (add a rule every time an agent repeats a mistake).

---

## PART G — What this plan does NOT do (so you don't assume it's complete)

Agents can build the software. They **cannot**:
1. **Tell you whether customers will pay.** Run the validation plan (strategy report §19) in parallel — a 6-week concierge pilot with ~10 firms.
2. **Provide real Tally/Busy export samples.** You must collect them (Phase 3 prerequisite).
3. **Approve tax/legal logic.** A practising CA must review `compliance-rules.md` and every user-visible compliance sentence.
4. **Create your WhatsApp Business account/templates, payment-gateway account, domain, hosting, legal documents.** Human tasks (P5-T1, P6-T1, P6-T6).
5. **Replace judgement.** Treat agent output as a draft: read diffs, run the app, test with realistic data. Keep human gates on migrations, auth, money, and deletions.
6. **Guarantee forecast accuracy.** D4 is a reasoned v1; accept or change it only after backtesting on real data.

**Honest timeline:** Phases 0–2 ≈ 5–6 weeks, Phases 3–4 ≈ 6–8 weeks, Phases 5–6 ≈ 4–5 weeks, with one developer supervising agents — roughly **4–5 months to a chargeable v1**, assuming you work on it consistently. These are estimates, not commitments.

---

## PART H — Solo-developer / Antigravity addendum
The schedule, scope cuts, week-12 go/no-go gate, and the throwaway pilot script (PX-T1) are defined in `docs/ANTIGRAVITY_PLAYBOOK.md` §6 and **override** the estimates in Part G of this plan. Run tasks with the `/start-task` → `/implement` → `/cross-review` → `/docs-sync` → `/end-of-day` workflows in `.agent/workflows/`.
