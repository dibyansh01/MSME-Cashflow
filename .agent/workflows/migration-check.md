---
description: Safety check before applying any Prisma migration.
---
1. Confirm `DATABASE_URL` points to a **local/dev** database. If unsure, stop and ask me.
2. Show me the generated SQL (`prisma migrate dev --create-only`) and explain: destructive statements, locks, backfills, nullable→NOT NULL steps.
3. Ensure the migration follows: add nullable → backfill → enforce NOT NULL; no drop in the same release as its replacement.
4. Write the rollback steps in `docs/runbooks/migrations.md` (append an entry with date + task ID).
5. Apply only after I say "apply". Then run the full test suite and the seeded-data reconciliation test.
