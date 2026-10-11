# API & Route Handler Contracts

Specifications for server actions, route handlers, and export APIs.

## Conventions
- Server actions and route handlers enforce authentication via `lib/auth/session.ts`.
- Server-side role permissions enforced via `requirePermission(...)`.
- Input validation enforced at the boundary with Zod schemas.
- Responses return typed result objects; errors are plain and actionable.
