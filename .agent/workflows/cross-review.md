---
description: Independent review of the current branch against the Definition of Done. Run it with a DIFFERENT model than the one that wrote the code.
---
1. Diff the current branch against `main`.
2. Check against `AGENTS.md` Definition of Done and the task's acceptance criteria.
3. Specifically verify: tenant scoping on every query; server-side permission checks; Decimal money (no `number` arithmetic on currency); audit rows on money mutations; reuse of existing code (no parallel duplicates); dead code removed; tests assert behaviour (not snapshots only) and include edge cases; docs and CHANGELOG updated; no PII in logs; no scope creep.
4. Output two lists: **Blocking** and **Non-blocking**, each with file/line references and a suggested fix. Do not modify code.
