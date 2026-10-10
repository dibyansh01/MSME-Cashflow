# AGENTS.md — Standing rules for all coding agents (Claude, Gemini, others)

> Put this file in the repository root. Also copy or symlink it to wherever your Antigravity version reads workspace rules (commonly `GEMINI.md` or `.agent/rules/` — **verify in your version**; `AGENTS.md` is the cross-tool convention).
> Read this file, then `docs/DEVELOPMENT_PLAN.md`, before every task.

## 1. What this product is
A weekly **cash-planning layer** for owner-run Indian B2B manufacturers/traders (₹5–50 cr, Tally/Busy users). It tells the owner whom to chase, which bills to pay first, and what cash will look like over 13 weeks. It is **not** an ERP, billing tool, or GST-filing tool. If a task drifts toward invoicing, inventory, GST returns, bank reconciliation, payroll or full accounting, **stop and ask the human**.

## 2. Non-negotiable engineering rules
1. **One task = one branch = one PR.** Branch name `feat/<task-id>-<slug>`. Never work on `main`.
2. **Plan first.** Before editing, post a short plan: files to touch, files to reuse, risks, tests. Wait for approval on anything marked **[HUMAN GATE]** in the plan (DB migrations, auth, tenancy, money, deletion of modules).
3. **Reuse before writing.** Search the repo for an existing service/util/component first (`lib/services`, `lib/utils`, `lib/analytics`, `lib/collections`, `components/`, `app/components/ui`). Extend or refactor it; do **not** create a parallel version. If you replace something, delete the old one in the same PR and update imports.
4. **Money is `Decimal`, never `number`/`Float`.** All money math goes through `lib/money.ts`. No floating-point arithmetic on currency anywhere.
5. **Every query is tenant-scoped.** Use the tenant-scoped Prisma helper (`lib/db/tenant.ts`) — never the raw client in feature code. No query may run without an `organizationId`.
6. **Authorisation is enforced on the server** (server actions, route handlers, export API) using `lib/auth/permissions.ts`. UI hiding is not security.
7. **Business logic lives in `lib/domain/*` (pure, testable functions).** Pages, server actions and components call domain functions; they don't contain formulas.
8. **Every financial mutation writes an audit-log row** (who, what, before/after, when) in the same DB transaction.
9. **No `console.log` of customer data, no Prisma `log: ['query']` in production.** Use the structured logger in `lib/logger.ts`.
10. **Migrations only** (`prisma migrate`), never `db push`, on any shared database. Migrations must be reversible or have a documented rollback.
11. **Tests are part of the change.** Domain code needs unit tests (Vitest). Bug fixes need a regression test. A PR without tests for new domain logic is incomplete.
12. **Don't add dependencies** without a short ADR in `docs/adr/` (why, alternatives, size, licence, maintenance).
13. **Docs are part of the change** (see §4).
14. **Don't invent legal/tax rules.** Rules for 43B(h), GST ITC, MSMED Act live in `docs/domain/compliance-rules.md`, each with a source link and "CA review: pending/approved". If a rule isn't there, ask. Never change a rule silently.
15. **Small, reversible steps.** If a task needs more than ~400 changed lines (excluding generated files and tests), split it.

## 2a. Code conventions
- TypeScript `strict`. No `any` without a `// reason:` comment. Validate all external input with **zod** at the boundary (server actions, route handlers, import files, webhooks).
- Server Components by default; `'use client'` only for state/events.
- After mutations, `revalidatePath`/`revalidateTag` for affected routes.
- Dates: store UTC; business-day logic uses `Asia/Kolkata`. Use one date util module; no ad-hoc `new Date()` math in components.
- UI: reuse `app/components/ui` primitives; keep light/dark variants; keep pages responsive for a mid-range Android phone.
- Naming: domain terms are `customer`, `vendor`, `invoice`, `receipt`, `allocation`, `promise`, `commitment`, `obligation`. Don't invent synonyms.
- Errors: return typed results from domain functions; throw only for programmer errors. User-facing messages are plain and actionable.

## 3. Definition of Done (every PR)
- [ ] Plan was posted; human gates respected
- [ ] Reused existing code where available (list what you reused in the PR)
- [ ] Types/lint/tests pass (`npm run typecheck && npm run lint && npm test`)
- [ ] New/changed domain logic has unit tests, including edge cases (zero, partial payment, rounding, timezone, empty data)
- [ ] Tenant isolation test added if you touched data access
- [ ] Audit log written for money-affecting mutations
- [ ] No secrets, no PII in logs
- [ ] Docs updated (§4) and `CHANGELOG.md` entry added
- [ ] Manual verification steps written in the PR description
- [ ] Old/dead code removed

## 4. Documentation duties
Update in the same PR as the code:
| What changed | Update |
|---|---|
| Data model | `docs/architecture/data-model.md` (+ ER diagram) |
| Business formula/rule | `docs/domain/*.md` with worked numeric example |
| Architectural choice | New ADR in `docs/adr/NNNN-title.md` |
| Env var / setup step | `README.md` + `.env.example` |
| API/server action contract | `docs/api/*.md` |
| User-visible behaviour | `docs/user-guide/*.md` (Hindi/English labels where relevant) |
| Anything shipped | `CHANGELOG.md` |

## 5. Working in Antigravity as a solo developer
- The human is the **only** developer, reviewer, QA and product owner. Agents propose; the human approves.
- **One task ID per conversation.** Start with `/start-task <ID>`, approve the plan artifact, then `/implement`, review the walkthrough artifact, run `/cross-review` **with a different model than the one that wrote the code**, then `/docs-sync` and `/end-of-day`. See `docs/ANTIGRAVITY_PLAYBOOK.md`.
- **Model assignment (suggested; check the model selector for what is currently available):** a Claude model for schema/migrations, tenancy, money, security, domain logic and review; a Gemini model for UI, docs, test scaffolding and mechanical refactors. The reviewer must differ from the author.
- **Parallel agents:** at most two, each in its own git worktree/branch, touching disjoint paths. Never two agents on the same files.
- **Memory lives in the repo**, not in chat: `docs/STATE.md` (where we are), `docs/BACKLOG.md` (out-of-scope finds), ADRs, domain docs. Always read `docs/STATE.md` first.
- If the same mistake happens twice, propose a one-line addition to this file.

## 6. Stop-and-ask triggers
Ask the human (stop and wait) before: deleting a module, changing auth, running a destructive migration, adding a paid service, changing a tax/compliance rule, altering pricing/billing, sending real WhatsApp messages, or touching production data.