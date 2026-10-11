# Development Setup & Local Credentials

> **Notice:** This document is strictly for local development and CI testing environments. Never reuse these credentials in staging or production.

---

## 1. Local Environment Setup

1. **Start PostgreSQL via Docker:**
   ```bash
   docker compose up -d
   ```

2. **Configure Environment:**
   Copy the provided `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies & Generate Prisma Client:**
   ```bash
   npm install
   npx prisma generate
   ```

4. **Apply Migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed Sample Data (Local Dev Only):**
   ```bash
   npx prisma db seed
   ```

---

## 2. Seeded Local Demo Accounts

When seeded in a local development environment, the database creates the following test accounts (Password: `password123` for all):

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **OWNER (Admin)** | `test@email.com` | `password123` | Full access to Executive Dashboard, Cash Flow Forecasting, and GST Leakage Audit |
| **ACCOUNTS** | `accounts@msme.com` | `password123` | Operational access to Billing, Payables Queue, and Vendor settlements |
| **SALES** | `sales@msme.com` | `password123` | Customer onboarding, invoice creation, and Collections Queue follow-ups |

---

## 3. Running Verification Suite

```bash
# Run unit and calculation test suite
npm test

# Run TypeScript compilation check
npm run typecheck

# Run linter
npm run lint

# Check code formatting
npm run format:check

# Production build test
npm run build
```
