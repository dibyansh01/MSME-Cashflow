---
description: Implement an approved plan on a feature branch with tests, docs and a walkthrough.
---
Usage: `/implement` (after I approved the plan in this conversation)

1. Confirm the git working tree is clean; create branch `feat/<task-id>-<slug>` (ask me if a worktree/branch already exists).
2. For domain logic: write the failing unit tests first (from the plan's test cases), then implement in `lib/domain/**`.
3. Implement the change, reusing the listed code. Delete code on the Remove list in this same change and fix imports.
4. If the schema changed, run `/migration-check` before applying any migration.
5. Run `npm run typecheck && npm run lint && npm test`. Fix failures; if you cannot fix after two attempts, stop and report what you tried.
6. If you touched data access, run/add the cross-tenant isolation test.
7. Run `/docs-sync`.
8. Produce a **walkthrough artifact**: what changed, files list, test results, screenshots/recording from the browser agent if UI changed, manual verification steps, known limitations, anything uncertain.
9. **STOP** and wait for my review. Do not merge or push.
