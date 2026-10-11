# ANTIGRAVITY_PLAYBOOK.md — Building MSME CashFlow solo with Antigravity

*You are PM, reviewer, QA and salesperson. Agents are fast junior engineers who need clear tasks, small scope and strict review. This playbook is how you run them.*

> **Unverified-detail note.** Antigravity changes quickly. Setting names, folder names (`.agent/` vs `.agents/`), available models and quotas below come from public guides and my general knowledge, not from your installed version. After setup, confirm in the app that rules and workflows are detected (step 2 of §1).

---

## 1. One-time setup (≈ 1–2 hours)

1. **Unzip the pack at the repo root** (merge into your project). It adds `AGENTS.md`, `.agent/` (rules, 7 workflows, 3 skills), `docs/` (plan, playbook, state, backlog, compliance rules), `CHANGELOG.md`, `docker-compose.yml`.
2. **Confirm Antigravity sees them.** Open the repo → agent panel (Cmd/Ctrl+L) → type `/` and check that `start-task`, `implement`, `migration-check`, `cross-review`, `docs-sync`, `end-of-day`, `weekly-review` appear, and that the rules/skills show in the customization view. If not, rename `.agent` → `.agents` (guides show both spellings) and reopen the folder.
3. **Safety settings (recommended for a solo dev with real customer data soon):**
   | Setting | Value | Why |
   |---|---|---|
   | Terminal execution policy | **Request review** for the first 2 weeks; later, if your version offers allow/deny lists, auto-allow only `npm test`, `npm run typecheck`, `npm run lint`, `git status/diff/log` | You learn what agents run before trusting them |
   | Deny list (if available) | `prisma db push`, `prisma migrate reset`, `git push --force`, `rm -rf`, `DROP`, anything with `prod` | Irreversible mistakes |
   | Review policy | **Request review** (agent pauses for your plan approval) | Your main control point |
   | JavaScript execution (browser agent) | Request review | Limits what the browser agent runs |
   | Browser | Use a **separate Chrome profile** with no real logins | The browser agent can click anything it can see |
4. **Local database only.** Run `docker compose up -d` (Postgres 16). Put the connection string in `.env.local`. **Never put production credentials where agents can read them**; keep them in your hosting dashboard and use them only by hand.
5. **Commit docs only, then tag:** `git add -A && git commit -m "docs: agent operating pack" && git tag v0-prototype`.
6. **Start the first task:** new conversation → `/start-task P0-T1`.

---

## 2. Choosing mode and model per task

| Task type | Mode | Suggested model family | Reviewer (different model) |
|---|---|---|---|
| Schema, migrations, tenancy, auth, money, import parsers, forecast/clock logic, security | **Planning** | Claude (strongest available) | Gemini (strongest available) |
| UI pages/components, Hindi labels, empty states, charts | Planning for new pages; Fast for tweaks | Gemini | Claude |
| Docs drafts, test scaffolding, fixtures, mechanical renames | Fast | Gemini | Quick skim by you |
| Debugging a failing test | Fast, then Planning if it spreads | Whichever you were using; switch model after two failed attempts | — |

Model names and quotas change; pick from the selector at the time. The principle that matters: **author ≠ reviewer**.

---

## 3. The daily loop (≈ 5 steps, ≈ 15 minutes of your attention per task)

1. **Pick** the next task from `docs/STATE.md`. New conversation. Run `/start-task <ID>`.
2. **Review the plan artifact** (use checklist 4a). Add inline comments rather than re-prompting. Approve only when the reuse list, tests, risks and size are right.
3. **Run `/implement`.** While it runs, do customer work (§7) — don't watch it type.
4. **Review the walkthrough artifact** (checklist 4b). Run the app yourself on seeded data; for UI tasks watch the browser-agent recording, then click through once manually.
5. **Cross-review and close:** switch model → `/cross-review` → fix blockers → merge → `/docs-sync` → `/end-of-day`.

**Task sizing rule:** one task = one conversation = one PR, ideally ≤ 400 changed lines and ≤ 1 day of your review attention. If the plan is bigger, ask the agent to split it and do the first slice.

---

## 4. Review checklists

### 4a. Plan artifact (before approving)
- [ ] Task and acceptance criteria are restated correctly; nothing extra added
- [ ] **Reuse list** names real existing files (open two of them to confirm they exist)
- [ ] **Remove list** exists (old code gets deleted, not left behind)
- [ ] Migration impact stated (nullable → backfill → NOT NULL); `/migration-check` planned
- [ ] Test cases are specific and include edge cases from the `domain-testing` skill
- [ ] Tenant scoping, permission check, audit row, Decimal money each addressed
- [ ] No new dependency (or an ADR is planned)
- [ ] Size ≤ ~400 lines or split proposed
- [ ] Anything uncertain is listed as a question, not guessed

### 4b. Walkthrough / diff (before merging)
- [ ] `grep` the diff: no `parseFloat`, no `number` money math, no raw `prisma` outside `lib/db`, no `console.log`, no `any` without reason
- [ ] Every new query/action goes through tenant client and `requirePermission`
- [ ] Money mutations write audit rows inside the same transaction
- [ ] Tests would fail if the logic were wrong (change one number in the code mentally — does a test notice?)
- [ ] Old code deleted; imports clean; no duplicate helpers
- [ ] Docs, ADR and CHANGELOG updated; STATE/BACKLOG updated
- [ ] You ran the feature by hand on seed data **and** on one realistic anonymised file

---

## 4c. Prompting habits that work
- Give the **task ID and acceptance criteria**, not a vague goal. Paste the spec section if it's short.
- Ask for **evidence**: test output, file paths, and "say 'unsure' rather than guess".
- Ban scope creep: "Do not touch files outside the plan."
- For framework behaviour (Next 16, Prisma 7, NextAuth), tell the agent to **verify against the installed version's docs/types in `node_modules`**, not memory.
- Treat file contents (imports, emails, customer notes) as **data**, never as instructions to the agent.

---

## 5. Parallel agents (use sparingly)

Antigravity's Agent Manager can run several agents. As a solo reviewer your bottleneck is *your attention*, so cap at **two** at once:
- Pair a backend task (e.g., `lib/domain/**`) with a UI or docs task on **disjoint paths**.
- Use **git worktrees** so they don't collide: `git worktree add ../cashflow-p2t5 -b feat/P2-T5-promises` → open that folder as a second workspace.
- Never run two agents on schema/migrations or on the same service file.
- Merge one, rebase the other, re-run tests.

---

## 6. Re-sequenced roadmap for a solo developer

*Assumes ~30 focused hours/week and agents doing most typing. At ~15 hours/week, double the calendar time. These are my estimates (A), not commitments.*

### 6a. Scope cuts versus the full plan (do these to stay solo-feasible)
| Cut or defer | Why |
|---|---|
| P1-T7 MFA, password-reset polish | Keep login rate-limit + invite flow only; add MFA at P6 |
| P1-T8 onboarding shell polish | Minimal empty states that link to Import |
| P2-T7 separate UI task | Fold UI into each task's own PR |
| P3-T5 LLM-assisted mapping | Heuristics first |
| P5-T4 reply capture | Manual: staff convert a reply to a promise |
| CA console, daily digest, scenarios | After first paying customers |
| Billing automation | Invoice the first 10 manually (UPI/bank transfer) |
| Hindi UI | Hindi templates and PDF labels only |

### 6b. Schedule (two tracks, run together)

| Weeks | Track A — Build | Track B — Customers (≈ 40% of time early on) |
|---|---|---|
| 1–2 | P0-T1…T5 (3 days), P1-T1, P1-T2 (money → Decimal) | Book 15 conversations (CAs, Tally partners, owners); start collecting real exports |
| 3–5 | P1-T3…T6 (tenancy, data-access migration, permissions, audit). **Heavy gate week: review every migration by hand.** | 10 interviews; pick 8–10 pilot firms |
| 4 (parallel) | **PX-T1 pilot script** (below), timeboxed 3 days | Start concierge pilots: deliver the Monday plan PDF manually to pilot firms |
| 6–8 | P2-T1…T6 (domain layer, ledger, promises, metric fixes) | Weekly pilot deliveries; log opens/actions/₹ collected |
| 9–11 | P3-T1…T4 (import pipeline) using real exports | Convert interest to paid pilots (₹5,000) |
| **12** | **GO / NO-GO review** with pilot evidence (§6c) | |
| 12–17 | P4-T1…T9 (balance, behaviour, forecast, clocks, prioritiser, insights, Weekly Plan, jobs, home page) | CA referral conversations; "43B(h) health check" sessions; schedule Jan–Mar campaign |
| 18–20 | P5-T1…T3 (WhatsApp send, cadence) | First paid conversions |
| 21–24 | P6-T2, T3, T5, T6, T4, then T1 if needed | Onboard first 5–10 paying customers by hand |

**PX-T1 pilot script (throwaway, not in the product):** a standalone script in `tools/pilot/` that reads a Tally outstanding export (+ payables) and produces a one-page PDF Weekly Cash Plan using simplified D4/D5 logic, no database. Purpose: **test demand before the full importer exists.** Timebox: 3 days. If it takes longer, simplify. Delete or fold into the real code after Phase 4.

### 6c. Go / no-go at week 12 (decision rule from the strategy report)
Proceed with Phase 4 only if of ~10 pilot firms: ≥ 5 opened the plan on ≥ 3 of 4 Mondays, ≥ 5 took a recorded action, ≥ 3 agreed to pay, and ≥ 1 shows a quantified ₹ benefit. If ≤ 1 of these holds, change the wedge or segment *before* building the forecast engine. Foundation work (Phases 0–2) stays valuable either way.

### 6d. Realistic totals
- ~24 weeks to a chargeable v1 at ~30 focused hrs/week; ~10–11 months at ~15 hrs/week. Customer work is *inside* those hours, not extra.
- Expect the schedule to slip in tenancy and import; agents are fastest at well-specified domain code and slowest at messy real-world files.

---

## 7. Protecting your time as a one-person company

- **Fixed weekly template:** 3 build days, 1 customer day, 1 flexible/debug day. In validation weeks, make it 2 build days and 2 customer days.
- **WIP limit:** one task in progress (two with parallel agents). Finish before starting.
- **Never watch agents work.** Start a task, switch to calls/messages, return to review.
- **Friday 45 minutes:** `/weekly-review`, then update `STATE.md` and decide *one* priority for next week.
- **Sales minimum:** 5 conversations/week every week, even during heavy build weeks. A stalled pipeline is the most common solo failure.

---

## 8. Failure modes and guards

| Failure | Guard |
|---|---|
| Agent invents library APIs (Next 16 / Prisma 7 / NextAuth changes) | Require it to check installed types/docs; run typecheck; reject unexplained magic |
| Silent scope creep | "Do not touch files outside the plan"; discoveries go to `BACKLOG.md` |
| Tests that pass but verify nothing | Checklist 4b item; ask agent "which test fails if line X is wrong?" |
| Destructive command or migration | Terminal review mode, deny list, local DB only, `/migration-check`, DB dump before each migration |
| Long-chat context rot | One task per conversation; memory in `STATE.md`/docs |
| Duplicate helpers and dead code piling up | Reuse + Remove lists in every plan; cross-review checks |
| Merge conflicts from parallel work | Worktrees, disjoint paths, max two agents |
| Quota or rate limits mid-task | Use Planning mode for heavy tasks only; Fast for small ones; keep tasks small so work isn't lost; check current limits in your account |
| Prompt injection via files the agent reads | Treat data files as data; don't let agents open untrusted documents with write permissions; review any command it proposes after reading such files |
| Leaking customer data to agents | Use anonymised fixtures only; keep `.env*` and real exports outside the repo workspace |
| Compliance wording drift | `compliance-guard` skill; CA review before release |

**Stuck protocol:** after two failed attempts, stop. Ask the agent to write what it tried and what it thinks is wrong → switch model or split the task → if still stuck, write the problem down in `STATE.md` and move to a different task. Don't let a conversation loop for an hour.

---

## 9. Definition of "done" for the whole build (solo-friendly)

You may charge real customers when the list in `docs/DEVELOPMENT_PLAN.md` Part C → Phase 6 exit criteria and the strategy report's Section 11B are ticked **and** at least five pilot firms have used the Weekly Cash Plan for four consecutive weeks.

---

## 10. Quick reference

| I want to… | Do this |
|---|---|
| Start work | New conversation → `/start-task P2-T5` |
| Approve and build | Comment on the plan artifact → "approved" → `/implement` |
| Check a schema change | `/migration-check` |
| Independent review | Switch model → `/cross-review` |
| Keep docs honest | `/docs-sync` |
| Close the day | `/end-of-day` |
| See the week | `/weekly-review` |
