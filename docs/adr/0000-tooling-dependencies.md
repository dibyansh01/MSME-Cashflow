# 0000. Tooling Dependencies: Vitest, Zod, and Prettier

- **Date:** 2026-10-11
- **Status:** Accepted
- **Task:** P0-T2

## Context
As defined in `DEVELOPMENT_PLAN.md` and `AGENTS.md`, all upcoming domain logic, money operations, and multi-tenancy access control require rigorous automated testing and runtime input validation. We also need consistent code formatting in developer workflows and automated CI pipelines.

## Decision

### 1. Vitest (`vitest`) as Unit Test Runner
- **Purpose:** Fast unit and domain logic testing.
- **Why chosen:** Native TypeScript and ESM support out of the box, fast in-memory execution, compatible with modern Next.js 16 and Node 20+.
- **Alternatives considered:**
  - *Jest:* Slower execution, requires complex Babel/`ts-jest` transpilation configurations and has fragile ESM support in modern Next.js setups.
- **License:** MIT.
- **Size / Footprint:** devDependency only; runs purely in local test environments and CI.

### 2. Zod (`zod`) for Runtime Boundary Validation
- **Purpose:** Strict validation of environment variables (`lib/env.ts`), API inputs, server actions, and external import feeds.
- **Why chosen:** Zero dependencies, schema-driven with first-class TypeScript type inference (`z.infer`), clean and actionable error reporting.
- **Alternatives considered:**
  - *Yup / Joi:* Inferior TypeScript ergonomics and larger bundle baggage.
  - *Valibot:* Lighter but less ecosystem maturity and third-party library adoption.
- **License:** MIT.
- **Size / Footprint:** ~60 KB runtime bundle, 0 sub-dependencies.

### 3. Prettier (`prettier`) for Code Formatting
- **Purpose:** Consistent automated code formatting.
- **Why chosen:** Established standard; cleanly separates code style formatting from ESLint static analysis.
- **Alternatives considered:**
  - *ESLint stylistic:* Deprecated in ESLint 9 in favor of dedicated formatters.
- **License:** MIT.
- **Size / Footprint:** devDependency only.

## Consequences
- Fast, reliable test runs via `npm test` (`vitest run`).
- Fail-fast validation of critical environment variables via `lib/env.ts` during app startup and testing.
- Formatting consistency verified via `npm run format:check`.
