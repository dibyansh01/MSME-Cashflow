# PROGRESS.md — master checklist

Legend: `[ ]` not started · `[~]` in progress / in review · `[x]` done (merged + verified, with date) · `[-]` deliberately deferred
Task details live in `docs/DEVELOPMENT_PLAN.md`; schedule in `docs/ANTIGRAVITY_PLAYBOOK.md` §6. Update via `/implement` and `/end-of-day`.

**Current phase:** Phase 0

## Phase 0 — Baseline and safety (weeks 1–2)
- [~] P0-T1 Baseline snapshot and tag (branch: feat/p0-t1-baseline-snapshot)
- [~] P0-T2 Tooling: Vitest, lint/typecheck scripts, CI, env validation (branch: feat/p0-t2-tooling)
- [ ] P0-T3 Port `scripts/` checks into Vitest tests
- [ ] P0-T4 Hygiene: remove query logging, demo creds, baseline migration **[HUMAN GATE]**
- [ ] P0-T5 Docs skeleton (`docs/` tree, glossary, ADR template)

## Phase 1 — Foundation (weeks 1–5)
- [ ] P1-T1 `lib/money.ts` + ADR
- [ ] P1-T2 Money columns → Decimal **[HUMAN GATE]**
- [ ] P1-T3 Tenancy foundation (Organization, Membership, tenant client, RLS) **[HUMAN GATE]**
- [ ] P1-T4 Move all data access to tenant client + cross-tenant tests
- [ ] P1-T5 Permissions map, server-side enforcement, export RBAC
- [ ] P1-T6 Audit log
- [-] P1-T7 Auth hardening (do only: login rate-limit + invite users now; MFA/password-reset later at P6) **[HUMAN GATE]**
- [-] P1-T8 Onboarding shell (minimal empty states only)

## Phase 2 — Domain correctness (weeks 6–8)
- [ ] P2-T1 Domain layer extraction (`lib/domain/*`)
- [ ] P2-T2 Ledger upgrade: receipts, allocations, adjustments, credit notes **[HUMAN GATE]**
- [ ] P2-T3 Computed status (remove stored OVERDUE)
- [ ] P2-T4 Party fields: GSTIN, credit limit, Udyam/MSE data
- [ ] P2-T5 Customer-level promise-to-pay
- [ ] P2-T6 Fix metrics: ITC clock, GST drag, rename Net Cash, remove GST rate-mix
- [-] P2-T7 Separate UI task (folded into each task's own PR)

## Pilot script (week 4, throwaway)
- [ ] PX-T1 `tools/pilot/` script: Tally export → one-page Weekly Cash Plan PDF (3 days max)

## Phase 3 — Import pipeline (weeks 9–11)
- [ ] P3-T1 Import framework (staging, mapping, preview, commit, rollback)
- [ ] P3-T2 Parsers for Tally/Busy exports (needs real fixtures)
- [ ] P3-T3 Party matching
- [ ] P3-T4 Import UI
- [-] P3-T5 LLM-assisted mapping

## ⛔ Week-12 GO / NO-GO review (see playbook §6c) — [ ] decision recorded in DEVLOG

## Phase 4 — Cash engine (weeks 12–17)
- [ ] P4-T1 Bank balance + commitments
- [ ] P4-T2 Customer payment-behaviour metrics
- [ ] P4-T3 13-week forecast v1
- [ ] P4-T4 Obligation clocks (43B(h), 180-day ITC) + year-end report **[HUMAN GATE: CA review]**
- [ ] P4-T5 Payables prioritisation
- [ ] P4-T6 Insight rules (5)
- [ ] P4-T7 Weekly Cash Plan (PDF + web)
- [ ] P4-T8 Job scheduler
- [ ] P4-T9 "This week" home page and simplified navigation

## Phase 5 — Messaging (weeks 18–20)
- [ ] P5-T1 WhatsApp account + templates (human)
- [ ] P5-T2 Messaging abstraction + logging **[HUMAN GATE before real sends]**
- [ ] P5-T3 Reminder cadence
- [-] P5-T4 Reply capture

## Phase 6 — Product readiness (weeks 21–24)
- [ ] P6-T1 Billing (manual invoicing first)
- [ ] P6-T2 Operations: backups + tested restore, monitoring, staging
- [ ] P6-T3 Security review
- [ ] P6-T4 User docs (Hindi/English quick-start)
- [ ] P6-T5 Performance (50k invoices)
- [ ] P6-T6 Legal: terms, privacy, DPA, DPDP check (human)

---

## Human track (you do these; agents can't)
- [ ] H1 Book 15 conversations (CAs, Tally partners, owners) — week 1–2
- [ ] H2 Collect 5 real Tally/Busy exports, anonymised — before P3-T2
- [ ] H3 CA reviews `docs/domain/compliance-rules.md` — before P4-T4
- [ ] H4 Recruit 8–10 pilot firms; deliver Weekly Plan every Monday for 4 weeks — from week 4
- [ ] H5 Record pilot results (opens, actions, ₹ collected) in DEVLOG — weekly
- [ ] H6 Mystery-shop CredFlow, Recordent, Zoho Books Premium, Accountune — month 1
- [ ] H7 Create WhatsApp Business account and templates — before P5-T2
- [ ] H8 Payment gateway/billing account, domain, hosting — before P6-T1
- [ ] H9 Week-12 go/no-go decision — week 12
