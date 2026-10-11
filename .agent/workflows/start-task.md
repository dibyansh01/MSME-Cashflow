---
description: Begin a task from docs/DEVELOPMENT_PLAN.md — research, reuse list, implementation plan. Stops for approval.
---
Usage: `/start-task P2-T5`

1. Read `AGENTS.md`, `docs/STATE.md`, and the task card for the given ID in `docs/DEVELOPMENT_PLAN.md`, plus any Part D spec it references.
2. Search the repo for existing code related to the task (services, utils, components, tests). Build a **Reuse list** (what to reuse/extend) and a **Remove list** (what becomes dead).
3. Check whether the task is a **[HUMAN GATE]** task or touches schema, auth, tenancy, money, imports or compliance. If so, say so at the top of the plan.
4. Produce the **implementation plan artifact** containing: goal; files to change; reuse list; remove list; data/migration impact; test plan (named test cases incl. edge cases); docs to update; risks; estimated size (if > ~400 changed lines, propose splitting into sub-tasks); manual verification steps for me.
5. **STOP.** Do not edit files or run commands that change anything until I approve the plan or comment on it.
