---
description: "Where are we and what should I do next?" Reads the repo's records, checks them against git, and tells the developer the next step with the exact command to type.
---
Usage: `/next` (works in a brand-new conversation; this is the first thing to run each morning)

1. Read `docs/STATE.md`, `docs/PROGRESS.md`, the last 15 entries of `docs/DEVLOG.md`, and `docs/BACKLOG.md`.
2. Run (read-only): `git status --short`, `git branch --show-current`, `git branch --no-merged main`, `git log --oneline -15`.
3. **Check for drift.** Compare git against `docs/PROGRESS.md`:
   - A task ID appears in recent commits/branches but its box is not ticked (or the reverse).
   - Uncommitted changes exist that no task explains.
   If you find drift, list it first and ask me to confirm before changing any record.
4. Report in this exact format, in plain language (not jargon):
   - **Where we are:** current phase and the last thing finished (with date from DEVLOG).
   - **In progress:** branch name and what remains, or "nothing".
   - **Waiting on you (human tasks):** open items from the "Human track" section of `docs/PROGRESS.md` that are due or blocking, e.g. interviews, Tally exports, CA review.
   - **Do this next:** one task ID, one sentence on why it's next, expected size, and whether it is a **[HUMAN GATE]**.
   - **Type this:** the exact command, e.g. `/start-task P1-T2` (or `/implement` if a plan is already approved in an open conversation).
   - **Heads-up:** anything in BACKLOG with severity high.
5. Do not edit any file and do not start the task.
