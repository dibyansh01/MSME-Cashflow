# Always-on guardrails (short on purpose; full rules are in AGENTS.md)

- At the start of every conversation read `AGENTS.md`, `docs/STATE.md` and `docs/PROGRESS.md`. One task ID per conversation. If I ask "what next", run `/next`.
- Use **Planning mode** for anything touching schema, auth, tenancy, money, imports, or compliance. Produce the implementation plan artifact and STOP for approval.
- Never run: `prisma db push`, `prisma migrate reset`, `git push --force`, `rm -rf` outside `node_modules`/`.next`, or any command against a non-local database. Never read or print `.env*` files.
- Money = Decimal via `lib/money.ts`. Data access = tenant-scoped client only. Formulas live in `lib/domain/**` (no Prisma imports there).
- Reuse first: search `lib/`, `components/`, `app/components/ui` before writing anything new; list what you reused.
- Don't change `docs/domain/compliance-rules.md` or any tax/legal wording. Ask me.
- Don't expand scope. If you find another problem, add it to `docs/BACKLOG.md` and continue with the task.
- Never tick a task as done in `docs/PROGRESS.md` unless tests pass and docs are updated; only I confirm "merged and verified".
- Finish every task by running `/docs-sync` then `/end-of-day`.
