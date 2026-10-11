# Multi-Tenancy Architecture

> **Specification for Phase 1 (P1-T3, P1-T4).**

## Strategy
- Shared PostgreSQL database with `organizationId` column on every tenant-scoped table.
- Primary isolation via tenant-scoped Prisma client extension (`lib/db/tenant.ts`).
- Defence-in-depth via PostgreSQL Row-Level Security (RLS) policies.
- Every read, write, and export query requires explicit `organizationId` scope.
