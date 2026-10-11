# Background Jobs & Queue Architecture

> **Specification for scheduled operations.**

## Architecture
- Postgres-backed queue (pg-boss or lightweight polling table) avoiding Redis in early phases.
- Scheduled jobs:
  - Weekly Cash Plan compilation (Monday 06:00 IST).
  - Daily Promise status evaluation (Kept vs Broken).
  - Obligation clock warnings and daily insight generation.
