# MSME CashFlow Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

A modern, production-grade financial operations and cash flow intelligence platform engineered specifically for **Micro, Small, and Medium Enterprises (MSMEs)**. 

Beyond standard bookkeeping, **MSME CashFlow** bridges the gap between daily operations, debt recovery, and statutory compliance. It combines **real-time cash tracking**, **predictive cash flow forecasting**, **automated GST input/output cash management**, and a **CRM-style debt collection engine** featuring one-click WhatsApp escalations and automated risk scoring.

---

## 📑 Table of Contents

1. [System Overview & Value Proposition](#-system-overview--value-proposition)
2. [High-Level Architecture](#-high-level-architecture)
3. [Core Modules & Features](#-core-modules--features)
   - [1. Executive Owner Dashboard](#1-executive-owner-dashboard)
   - [2. Cash Flow Forecasting & Analytics](#2-cash-flow-forecasting--analytics)
   - [3. GST Intelligence & Leakage Audit](#3-gst-intelligence--leakage-audit)
   - [4. Customers & Invoicing (Cash-In)](#4-customers--invoicing-cash-in)
   - [5. Collections & Follow-ups Queue](#5-collections--follow-ups-queue)
   - [6. Vendors & Payables (Cash-Out)](#6-vendors--payables-cash-out)
   - [7. Payables Prioritization Queue](#7-payables-prioritization-queue)
   - [8. Direct Expenses & Cost Accounting](#8-direct-expenses--cost-accounting)
   - [9. Universal Export Engine (Excel & PDF)](#9-universal-export-engine-excel--pdf)
   - [10. Authentication & Role-Based Access Control](#10-authentication--role-based-access-control)
4. [Mathematical Formulations & Business Logic](#-mathematical-formulations--business-logic)
   - [GST Calculation Model (Inclusive vs Exclusive)](#gst-calculation-model-inclusive-vs-exclusive)
   - [Cash Flow & Net Position Calculation](#cash-flow--net-position-calculation)
   - [GST Cash Flow & Blocked Capital Logic](#gst-cash-flow--blocked-capital-logic)
   - [Customer Risk Scoring & Broken Promises Algorithm](#customer-risk-scoring--broken-promises-algorithm)
   - [Debt Aging Buckets & Automated Reminder Engine](#debt-aging-buckets--automated-reminder-engine)
5. [User Manual (Operational Playbook)](#-user-manual-operational-playbook)
   - [User Personas & Role Matrix](#user-personas--role-matrix)
   - [Workflow 1: Customer Setup & Invoicing](#workflow-1-customer-setup--invoicing)
   - [Workflow 2: Debt Recovery & WhatsApp Escalation](#workflow-2-debt-recovery--whatsapp-escalation)
   - [Workflow 3: Managing Payables & Vendor Due Dates](#workflow-3-managing-payables--vendor-due-dates)
   - [Workflow 4: Recording Expenses & Blocking Non-Claimable GST](#workflow-4-recording-expenses--blocking-non-claimable-gst)
   - [Workflow 5: Exporting Reports for Audits & Meetings](#workflow-5-exporting-reports-for-audits--meetings)
6. [Technical Documentation for Developers](#-technical-documentation-for-developers)
   - [Directory Structure](#directory-structure)
   - [Database Schema & Data Dictionary](#database-schema--data-dictionary)
   - [Prisma & PostgreSQL Engine Adapter](#prisma--postgresql-engine-adapter)
   - [Server Actions & Concurrency Transactions](#server-actions--concurrency-transactions)
   - [Export API Specification](#export-api-specification)
7. [Installation & Getting Started](#-installation--getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Configuration](#environment-configuration)
   - [Database Migration & Seeding](#database-migration--seeding)
   - [Running the Development Server](#running-the-development-server)
   - [Default Demo Credentials](#default-demo-credentials)
   - [Running Test & Verification Scripts](#running-test--verification-scripts)
8. [Extension & Contribution Guidelines](#-extension--contribution-guidelines)

---

## 🎯 System Overview & Value Proposition

Small and medium enterprises often fail not from lack of profitability, but from **illiquidity**—cash trapped in overdue receivables, unoptimized vendor payables, and blocked GST credits.

**MSME CashFlow solves four critical operational challenges:**
1. **Uncertain Cash Position:** Real-time calculation of net bankable cash (`Actual Inflows - Actual Outflows`), distinct from accrued accounting book profits.
2. **Receivables Aging & Broken Commitments:** Automatically tracks promised payment dates and flags repeat defaulters before credit limits are exceeded.
3. **GST Cash Flow Traps:** Clarifies how much GST is physically stuck in unpaid sales invoices and how much Input Tax Credit (ITC) is waiting to be unlocked by clearing vendor dues.
4. **GST Leakage Audit:** Identifies non-claimable GST paid on ineligible business expenses (e.g., food, entertainment, motor vehicles) that directly reduces bottom-line profitability.

---

## 🏗️ High-Level Architecture

The system utilizes Next.js 16 (App Router) with React 19 Server Components, Prisma 7 ORM with PostgreSQL Connection Pooling (`@prisma/adapter-pg`), Tailwind CSS 4, and NextAuth.js.

```mermaid
flowchart TD
    subgraph UI_Layer ["Presentation & UI Layer (React 19 / Tailwind CSS 4)"]
        Dashboard["Owner Dashboard (/dashboard)"]
        CashFlowUI["Cash Flow Analysis (/cash-flow)"]
        GSTUI["GST Insights (/gst-analytics)"]
        InvoicesUI["Invoicing & Receivables (/invoices)"]
        QueueUI["Collections Queue (/followups)"]
        PayablesUI["Payables Queue (/payables-queue)"]
        ExpensesUI["Expense Tracker (/expenses)"]
        ExportUI["Universal Export Engine (/api/export)"]
    end

    subgraph Auth_Security ["Authentication & RBAC"]
        NextAuth["NextAuth.js (JWT Strategy)"]
        Bcrypt["bcrypt Password Hash"]
        RoleCheck["Role Guard (OWNER / ACCOUNTS / SALES)"]
    end

    subgraph Service_Logic ["Business Logic & Analytics Services"]
        DashService["dashboardService.ts"]
        GSTService["gstAnalyticsService.ts"]
        RiskEngine["customerRisk.ts"]
        InvoiceCalc["invoice.ts (GST Engine)"]
        AgingCalc["aging.ts (Bucket Analysis)"]
        Templates["messageTemplates.ts (WhatsApp Engine)"]
    end

    subgraph Server_Actions ["Server Actions (Mutations & Transactions)"]
        InvAction["createInvoice / addPayment"]
        FollowupAction["createFollowUpAction"]
        VendorAction["createVendorInvoice / addVendorPayment"]
        ExpenseAction["createExpense"]
    end

    subgraph Data_Layer ["Data & Storage Layer"]
        PrismaORM["Prisma 7.3 Client (@prisma/adapter-pg)"]
        PGPool["pg.Pool Connection Pool"]
        PostgresDB[("PostgreSQL Database")]
    end

    UI_Layer --> Auth_Security
    Auth_Security --> Service_Logic
    UI_Layer --> Server_Actions
    Server_Actions --> PrismaORM
    Service_Logic --> PrismaORM
    PrismaORM --> PGPool
    PGPool --> PostgresDB
```

---

## 🌟 Core Modules & Features

### 1. Executive Owner Dashboard
- **Route:** `/dashboard`
- **Real-Time Financial Telemetry:**
  - **Business & Cash Snapshot:** Total Invoiced, Payment Collected, Total Outstanding, Total Overdue, and count of Overdue Customers.
  - **Cash-Out & Net Cash Position:** Total Cash Out (Expenses + Vendor Payments) alongside a prominent **Net Cash Position** card showing real liquidity (`+₹` or `-₹`).
  - **GST Snapshot:** Real-time counters for GST Collected (Output Tax), GST Paid (Claimable ITC), GST Paid (Blocked/Non-Claimable), and estimated Net GST Payable to the government.
  - **GST Cashflow Insights:**
    - **GST Cash Blocked:** Tax charged on credit invoices where customers have not yet paid.
    - **GST Credit Pending:** Input Tax Credits waiting to be unlocked upon paying outstanding vendor bills.
- **Operational Intelligence:**
  - **Upcoming Follow-ups:** Ranked timeline of scheduled collection calls and meetings for the selected date window.
  - **High-Risk Defaulters Table:** Pinpoints clients with broken promises and debt age exceeding 60 days.
  - **Aging Summary:** Distribution across `0-30`, `31-60`, `61-90`, and `90+` day buckets.
  - **Top Defaulters:** Top 5 debtors ranked by total overdue exposure.
- **Interactive Global Filtering:** Quick presets (`Next 30 Days`, `Next 7 Days`, `This Month`, `Last Month`, `Last 3 Months`, `Custom Range`).

### 2. Cash Flow Forecasting & Analytics
- **Route:** `/cash-flow`
- **Inflow vs Outflow Dual-Axis Intelligence:**
  - **Actual Past Inflows:** Confirmed cash collections recorded through payment entries prior to today.
  - **Projected Future Inflows:** Value of customer invoices scheduled to mature based on due dates.
  - **Actual Past Outflows:** Confirmed expenses and vendor bill payments disbursed prior to today.
  - **Projected Future Outflows:** Outstanding vendor bills scheduled for settlement based on due dates.
  - **Net Projected Cash Flow:** Forecasts potential liquidity shortfalls before they impact payroll or operations.

### 3. GST Intelligence & Leakage Audit
- **Route:** `/gst-analytics`
- **Visual Analytics Powered by Recharts:**
  - **GST Collected vs Paid Trend:** Multi-bar temporal chart comparing Output GST liabilities against Input Tax Credits month-over-month, week-over-week, or year-over-year.
  - **GST Rate Mix Breakdown:** Interactive donut/pie breakdown illustrating business distribution across standard brackets (`0%`, `5%`, `12%`, `18%`, `28%`).
  - **GST Leakage Audit (Non-Claimable Tax):**
    - **Breakdown by Expense Category:** Identifies where non-claimable GST is leaking (e.g., Office Catering, Travel, Fuel).
    - **Breakdown by Vendor:** Identifies suppliers supplying goods or services where ITC cannot be legally claimed under Section 17(5) of the CGST Act.
    - Shows exact percentage contribution to total cash leakage.

### 4. Customers & Invoicing (Cash-In)
- **Routes:** `/customers`, `/customers/new`, `/invoices`, `/invoices/new`, `/invoices/[id]`
- **Customer Directory:** Track clients, contact emails, phone numbers, geographic locations, and default credit terms (15, 30, 45, 60 days).
- **Dynamic Invoicing Engine:**
  - Automatically calculates maturity `dueDate` based on customer `creditTerms`.
  - Supports both **GST Exclusive** (`Base + GST`) and **GST Inclusive** (`Base / (1 + Rate)`) calculations.
  - Instant live tax calculation preview on invoice forms.
  - Granular lifecycle statuses: `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`.
- **Payment Settlement Sub-System:**
  - Dedicated `/payment` screen per invoice.
  - Multi-mode support: `UPI`, `BANK`, `CHEQUE`, `CASH`, `OTHER`.
  - Transaction reference ID and audit notes logging.
  - Automatic balance recalculation wrapped in atomic database transactions.

### 5. Collections & Follow-ups Queue
- **Routes:** `/followups`, `/invoices/[id]/followup`
- **Smart Debt Recovery Queue:** Automatically surfaces unpaid and overdue invoices sorted by urgency.
- **Interaction History:** Log interaction methods (`CALL`, `WHATSAPP`, `EMAIL`, `VISIT`) and outcomes (`PROMISED`, `NO_RESPONSE`, `PAID`, `DISPUTED`).
- **Next Follow-up Scheduling:** Assign future contact dates; automatically resurfaces invoices on the specified date.
- **Adaptive WhatsApp Messaging Engine:**
  - Dynamically synthesizes personalized, culturally courteous yet firm payment reminders in English with polite Hindi closures (*धन्यवाद 🙏*).
  - 1-Click action opens WhatsApp Web or mobile app with pre-filled customer details, invoice numbers, amounts, and overdue day counts.
  - Clipboard copy button for omnichannel dispatch.

### 6. Vendors & Payables (Cash-Out)
- **Routes:** `/vendors`, `/vendors/new`, `/vendor-invoices`, `/vendor-invoices/new`, `/vendor-invoices/[id]`
- **Vendor Directory:** Maintain supplier terms, communication coordinates, and bill histories.
- **Vendor Invoicing (Credit Purchases):**
  - Record supplier bills with invoice numbers, invoice dates, and due dates.
  - Track **GST Input Tax Credit Eligibility** via the `isGstEligible` flag.
  - Record partial and full payments with bank reference tracking.

### 7. Payables Prioritization Queue
- **Route:** `/payables-queue`
- **Cash Preservation Command Center:**
  - **Overdue Section:** Red-flagged bills that have breached credit periods.
  - **Due Soon Section:** Bills coming due within the next 7 calendar days.
  - Instant "Pay Now" shortcuts directly routing to payment execution forms to prevent supplier friction and credit rating downgrades.

### 8. Direct Expenses & Cost Accounting
- **Routes:** `/expenses`, `/expenses/new`
- **Immediate Cash Outflows:** Log operational expenses that bypass credit cycles (e.g., Salaries, Rent, Utilities, Daily Supplies).
- **Tax Classification:** Mark whether GST paid on an expense is eligible for Input Tax Credit or constitutes non-recoverable expense leakage.
- **Payment Modes:** `CASH`, `BANK`, `UPI`.

### 9. Universal Export Engine (Excel & PDF)
- **Route:** `/api/export`
- **Supported Entities:** `customers`, `invoices`, `collection`, `vendors`, `expenses`, `vendor-invoices`.
- **High-Fidelity Excel (.xlsx) Generation:** Built with `ExcelJS` featuring styled bold headers, autosized columns, and data formatting.
- **Professional PDF (.pdf) Reports:** Generated via `jspdf` and `jspdf-autotable` with corporate blue branding, tabular styling, and dynamic metadata ("Printed by: [User] on [Timestamp]").
- **Filter-Aware:** Exports respect active search queries, date ranges, and status filters applied on the UI.

### 10. Authentication & Role-Based Access Control
- **Route:** `/login`, `/api/auth/[...nextauth]`
- **Secure Authentication:** NextAuth credentials provider backed by `bcrypt` salted password hashing.
- **Role Hierarchy:**
  - `OWNER`: Unrestricted access across high-level dashboard, financial KPIs, leakage audits, and management queues.
  - `ACCOUNTS`: Operational control over billing, vendor bills, payments, and reconciliations.
  - `SALES`: Customer onboarding, sales invoice generation, and follow-up logging.
- **Branded Login Screen:** Trust-signaling layout with product features, validation error handling, and session persistence.

---

## 📐 Mathematical Formulations & Business Logic

### GST Calculation Model (Inclusive vs Exclusive)

The application implements standard Indian GST compliance arithmetic via `lib/utils/invoice.ts`:

#### Case 1: GST Exclusive Billing (`isGstInclusive = false`)
$$\text{GST Amount} = \text{Amount Entered} \times \left( \frac{\text{GST Rate}}{100} \right)$$
$$\text{Total Invoice Amount} = \text{Amount Entered} + \text{GST Amount}$$
$$\text{Base Amount} = \text{Amount Entered}$$

#### Case 2: GST Inclusive Billing (`isGstInclusive = true`)
$$\text{Base Amount} = \frac{\text{Amount Entered}}{1 + \left( \frac{\text{GST Rate}}{100} \right)}$$
$$\text{GST Amount} = \text{Amount Entered} - \text{Base Amount}$$
$$\text{Total Invoice Amount} = \text{Amount Entered}$$

---

### Cash Flow & Net Position Calculation

Implemented in `lib/services/dashboardService.ts`:

$$\text{Net Cash Position} = \sum \text{PaymentEntry.amount} - \left( \sum \text{Expense.amount} + \sum \text{VendorPayment.amount} \right)$$

$$\text{Net Cash Flow (Forecast)} = (\text{Past Inflows} + \text{Projected Inflows}) - (\text{Past Outflows} + \text{Projected Outflows})$$

Where:
- $\text{Projected Inflows} = \sum \text{Invoice.outstandingAmount}$ for invoices with $\text{dueDate} \ge \text{today}$.
- $\text{Projected Outflows} = \sum \text{VendorInvoice.outstandingAmount}$ for vendor bills with $\text{dueDate} \ge \text{today}$.

---

### GST Cash Flow & Blocked Capital Logic

$$\text{Net GST Payable} = \text{GST Collected} - \text{GST Paid (Claimable)}$$

Where:
- $\text{GST Collected} = \sum \text{Invoice.gstAmount}$ (Sales Output Tax).
- $\text{GST Paid (Claimable)} = \sum \text{VendorInvoice.gstAmount}_{\text{eligible}} + \sum \text{Expense.gstAmount}_{\text{eligible}}$ (Input Tax Credit).

#### 1. GST Cash Blocked (Trapped in Unpaid Customer Invoices)
When an enterprise issues an invoice, GST liability is incurred regardless of whether the customer has paid. The system computes the exact proportion of capital currently tied up in customer receivables:

$$\text{GST Cash Blocked} = \sum_{\text{unpaid invoices}} \left( \frac{\text{Invoice.gstAmount}}{\text{Invoice.invoiceAmount} + \text{Invoice.gstAmount}} \right) \times \text{Invoice.outstandingAmount}$$

#### 2. GST Credit Pending (Blocked Behind Unpaid Vendor Bills)
Input Tax Credit can generally only be safely claimed or utilized once vendor liabilities are discharged:

$$\text{GST Credit Pending} = \sum_{\text{unpaid vendor bills}} \text{VendorInvoice.gstAmount} \quad (\text{where } \text{isGstEligible} = \text{true})$$

---

### Customer Risk Scoring & Broken Promises Algorithm

Located in `lib/analytics/customerRisk.ts`, every client is dynamically classified into risk tiers:

```mermaid
flowchart TD
    Start["Evaluate Customer Invoices & FollowUps"] --> CalcAge["Calculate Oldest Overdue Days:
    max(today - invoice.dueDate)"]
    CalcAge --> CalcBroken["Count Broken Promises:
    FollowUp.status == 'PROMISED' AND
    FollowUp.nextFollowUpOn < today AND
    Invoice.outstandingAmount > 0"]
    CalcBroken --> CheckHigh{"Oldest Due > 60 Days
    OR
    Broken Promises >= 2?"}
    CheckHigh -- Yes --> HighRisk["Risk Level = HIGH (Red Badge)"]
    CheckHigh -- No --> CheckMed{"Oldest Due > 0 Days?"}
    CheckMed -- Yes --> MedRisk["Risk Level = MEDIUM (Yellow Badge)"]
    CheckMed -- No --> LowRisk["Risk Level = LOW (Green Badge)"]
```

---

### Debt Aging Buckets & Automated Reminder Engine

- **Aging Buckets:** Evaluated via `lib/utils/aging.ts`:
  - `CURRENT`: Due Date $\ge$ Today ($\text{Days Overdue} \le 0$).
  - `0-30 Days`: $\text{Days Overdue} \in [1, 30]$.
  - `31-60 Days`: $\text{Days Overdue} \in [31, 60]$.
  - `61-90 Days`: $\text{Days Overdue} \in [61, 90]$.
  - `90+ Days`: $\text{Days Overdue} > 90$ (Critical default threshold).

- **Adaptive Reminder Logic (`lib/collections/messageTemplates.ts`):**
  - **Due Today / Not Overdue ($\le 0$ days):**
    > *"Hi [Customer], this is a reminder that Invoice [No] of ₹[Amount] is due on [Date]. Please let us know if you need anything. धन्यवाद 🙏"*
  - **Early Overdue ($1 - 15$ days):**
    > *"Hi [Customer], Invoice [No] of ₹[Amount] is overdue by [X] days. Kindly arrange payment at your earliest. धन्यवाद 🙏"*
  - **Chronic Overdue ($> 15$ days):**
    > *"Hi [Customer], despite reminders, Invoice [No] of ₹[Amount] is overdue by [X] days. Please confirm payment timeline today."*

---

## 📖 User Manual (Operational Playbook)

### User Personas & Role Matrix

| Capability / Action | OWNER | ACCOUNTS | SALES |
| :--- | :---: | :---: | :---: |
| View Financial Dashboard & Net Cash Position | ✅ | ✅ | ❌ |
| View Cash Flow Forecasting (`/cash-flow`) | ✅ | ✅ | ❌ |
| Access GST Trends & Leakage Audit (`/gst-analytics`) | ✅ | ✅ | ❌ |
| Create Customers & View Customer Profiles | ✅ | ✅ | ✅ |
| Generate Sales Invoices & Record Payments | ✅ | ✅ | ✅ |
| Work Collections Queue & Log Follow-ups | ✅ | ✅ | ✅ |
| Create Vendors & Log Vendor Bills | ✅ | ✅ | ❌ |
| Access Payables Prioritization Queue | ✅ | ✅ | ❌ |
| Record Direct Expenses & Audit Non-Claimable GST | ✅ | ✅ | ❌ |
| Export Data to Excel and PDF | ✅ | ✅ | ✅ |

---

### Workflow 1: Customer Setup & Invoicing

1. **Onboard Customer:** Navigate to **Cash In > Customers**, click **+ New Customer**. Enter the legal name, contact phone, email, city location, and standard credit terms (e.g., 30 days).
2. **Issue Invoice:** Go to **Cash In > Invoices**, click **+ New**.
   - Select the Customer from the dropdown.
   - Enter your invoice serial number (e.g., `INV-2026-0042`).
   - Pick the invoice issue date. The system automatically sets the maturity due date based on the customer's credit terms.
   - Enter the Taxable Base Amount.
   - Select whether the amount is **GST Inclusive** or **Exclusive**, and enter the GST Rate (e.g., 18%).
   - If an immediate advance was received, enter the `Paid Amount`; otherwise leave it as `0`.
   - Click **Save Invoice**.

---

### Workflow 2: Debt Recovery & WhatsApp Escalation

1. **Review Priority Debt:** Open **Cash In > Follow-ups (Collections Queue)**.
2. Invoices are automatically prioritized by scheduled follow-up dates and overdue duration.
3. **Escalate via WhatsApp:**
   - In the row of the overdue customer, review the automatically drafted reminder in the **Reminder Message** box.
   - Click the green **WhatsApp** button. This automatically opens WhatsApp Web / mobile app with the pre-formatted message addressed to the customer.
   - Alternatively, click the copy icon to copy the message to your clipboard for SMS or email.
4. **Log the Interaction:**
   - Click **Follow-up** on the invoice row.
   - Select the channel used: `CALL`, `WHATSAPP`, `EMAIL`, or `VISIT`.
   - Record the customer response: `PROMISED`, `NO_RESPONSE`, `PAID`, or `DISPUTED`.
   - If the customer promised payment on a specific date, set the **Next Follow-up Date**. The queue will automatically bring this invoice back to your attention on that day.
5. **Record Payment Received:**
   - Once payment is confirmed, click **Payment** on the invoice.
   - Enter the amount received, payment date, payment mode (`UPI`, `BANK`, `CHEQUE`, `CASH`), and bank transaction reference ID.
   - Submit the form. The invoice status will automatically transition from `OVERDUE`/`UNPAID` to `PARTIAL` or `PAID`.

---

### Workflow 3: Managing Payables & Vendor Due Dates

1. **Register Suppliers:** Navigate to **Cash Out > Vendors** and add your suppliers with their agreed payment cycles.
2. **Log Vendor Invoices (Bills):** Go to **Cash Out > Vendor Invoices > + New**.
   - Enter the vendor bill number, invoice date, due date, and amount.
   - **Crucial Compliance Step:** Check **Eligible for GST Input Tax Credit (ITC)** if the goods/services qualify under GST rules. If it is an ineligible expense (e.g., personal consumption or blocked credits under GST Section 17(5)), uncheck this box.
3. **Prioritize via Payables Queue:** Go to **Cash Out > Payables Queue**.
   - The top section displays all **Overdue Payments** in red.
   - The second section displays bills **Due Soon (Next 7 Days)**.
   - Click **Pay Now** to execute disbursements and record transaction references.

---

### Workflow 4: Recording Expenses & Blocking Non-Claimable GST

1. Navigate to **Cash Out > Expenses > + New**.
2. Select the operational category (e.g., *Salaries*, *Rent*, *Transport & Logistics*, *Office Expenses*).
3. Specify the expense date, payment mode, and base amount.
4. Enter the applicable GST rate.
5. Select whether the GST is claimable. If you mark it as non-claimable, the tax amount will automatically flow into the **GST Leakage Audit** module on your analytics dashboard.

---

### Workflow 5: Exporting Reports for Audits & Meetings

1. Navigate to any operational module:
   - **Customers** (`/customers`)
   - **Invoices** (`/invoices`)
   - **Collections Queue** (`/followups`)
   - **Vendors** (`/vendors`)
   - **Vendor Invoices** (`/vendor-invoices`)
   - **Expenses** (`/expenses`)
2. Use the search bar, filter popovers, or date range filters to narrow down the dataset (e.g., "Status: Overdue", "Invoice Date: This Month").
3. Click the **Export** dropdown button in the top right.
4. Select **Excel** (`.xlsx`) or **PDF** (`.pdf`). The server will generate and stream the formatted document with user audit metadata and timestamps.

---

## 💻 Technical Documentation for Developers

### Directory Structure

```
msme-cashflow/
├── app/                              # Next.js 16 App Router Directory
│   ├── api/                          # REST API Endpoints
│   │   ├── auth/[...nextauth]/       # NextAuth credential authentication route
│   │   └── export/                   # Universal Excel & PDF report generation engine
│   ├── cash-flow/                    # Cash Flow actuals vs projections page
│   ├── components/                   # Application UI components & design system
│   │   └── ui/                       # Reusable UI primitives (Badges, Cards, Filters, Search, etc.)
│   ├── customers/                    # Customer listing, registration form & server actions
│   ├── dashboard/                    # Executive Owner Dashboard page
│   ├── expenses/                     # Direct expense tracking, forms & server actions
│   ├── followups/                    # CRM-style Debt Collections Queue page
│   ├── gst-analytics/                # GST trends, rate mix, and leakage audit page
│   ├── invoices/                     # Sales invoices listing, creation form & actions
│   │   └── [id]/                     # Detail view, payment history, followup timelines
│   ├── login/                        # Secure authentication login page
│   ├── payables-queue/               # Vendor payment prioritization queue page
│   ├── vendor-invoices/              # Vendor bills, credit purchases & payment actions
│   ├── vendors/                      # Vendor directory & creation forms
│   ├── globals.css                   # Tailwind CSS 4 global stylesheet
│   ├── layout.tsx                    # Root layout with ThemeProvider and NextAuth SessionProvider
│   ├── page.tsx                      # Root route redirector (routes to /dashboard)
│   └── providers.tsx                 # Client providers wrapper (next-auth + next-themes)
├── components/                       # Shared layout components
│   ├── analytics/                    # Recharts visual wrappers (GstTrendChart, GstRateMix, GstLeakageList)
│   ├── AppLayout.tsx                 # Responsive app frame with sidebar & header
│   ├── Navbar.tsx                    # Top navigation bar
│   ├── Sidebar.tsx                   # Collapsible desktop/mobile navigation sidebar
│   ├── WhatsAppActions.tsx           # WhatsApp deep-link & copy-to-clipboard buttons
│   └── copyButton.tsx                # Reusable clipboard helper
├── lib/                              # Core business logic, services & database clients
│   ├── analytics/                    # Risk classification algorithms (customerRisk.ts)
│   ├── collections/                  # Adaptive WhatsApp reminder message generators
│   ├── constants/                    # Color tokens and chart palettes
│   ├── db/                           # Prisma client singleton with PG connection pooling
│   ├── services/                     # High-level domain services (dashboard, gst, customers, expenses)
│   ├── utils/                        # Pure mathematical & date utility functions (aging, invoice, date)
│   ├── authOptions.ts                # NextAuth configuration, credentials provider & callbacks
│   └── utils.ts                      # Tailwind clsx / twMerge utility helper
├── prisma/                           # Database Schema & Migrations
│   ├── migrations/                   # Chronological SQL migration files
│   ├── schema.prisma                 # Primary Prisma database schema
│   ├── seed.ts                       # Realistic Indian MSME seed dataset generator
│   └── prisma.config.ts              # Prisma CLI configuration
├── public/                           # Static public assets and icons
├── scripts/                          # Self-contained verification & KPI assertion scripts
│   ├── verify-gst-calculation.ts     # Asserts inclusive/exclusive GST math
│   ├── verify-gst-kpis.ts            # Asserts dashboard GST aggregation metrics
│   ├── verify-invoice-calculation.ts # Asserts balance & payment updates
│   ├── verify-mandatory-invoice.ts   # Asserts database constraint rules
│   └── verify-optional-invoice.ts    # Asserts nullable fields behavior
├── types/                            # TypeScript type definitions
│   └── next-auth.d.ts                # NextAuth session and JWT type extensions
├── package.json                      # Dependency manifests & project scripts
├── tsconfig.json                     # TypeScript compiler configuration
└── eslint.config.mjs                 # ESLint rules configuration
```

---

### Database Schema & Data Dictionary

The data architecture is defined in `prisma/schema.prisma` and standardized on PostgreSQL:

```mermaid
erDiagram
    User {
        String id PK
        String name
        String email UK
        String password
        String role
        DateTime createdAt
    }

    Customer ||--o{ Invoice : "issues"
    Customer {
        String id PK
        String name
        String phone
        String email
        String location
        Int creditTerms
        String notes
        DateTime createdAt
    }

    Invoice ||--o{ FollowUp : "tracks"
    Invoice ||--o{ PaymentEntry : "collects"
    Invoice {
        String id PK
        String customerId FK
        String invoiceNo
        DateTime invoiceDate
        DateTime dueDate
        Float invoiceAmount
        Float gstAmount
        Float gstRate
        Boolean isGstInclusive
        Float paidAmount
        Float outstandingAmount
        String status
        DateTime createdAt
    }

    FollowUp {
        String id PK
        String invoiceId FK
        DateTime followUpDate
        String method
        String status
        String notes
        DateTime nextFollowUpOn
        DateTime createdAt
    }

    PaymentEntry {
        String id PK
        String invoiceId FK
        Float amount
        DateTime paymentDate
        String method
        String reference
        String notes
        DateTime createdAt
    }

    Vendor ||--o{ Expense : "receives"
    Vendor ||--o{ VendorInvoice : "bills"
    Vendor {
        String id PK
        String name
        String phone
        String email
        Int creditTerms
        String notes
        DateTime createdAt
    }

    ExpenseCategory ||--o{ Expense : "classifies"
    ExpenseCategory {
        String id PK
        String name
        DateTime createdAt
    }

    Expense {
        String id PK
        String vendorId FK
        String categoryId FK
        DateTime expenseDate
        Float amount
        Float gstAmount
        Float gstRate
        Boolean isGstInclusive
        Boolean isGstEligible
        String paymentMode
        String notes
        DateTime createdAt
    }

    VendorInvoice ||--o{ VendorPayment : "disburses"
    VendorInvoice {
        String id PK
        String vendorId FK
        String invoiceNo
        DateTime invoiceDate
        DateTime dueDate
        Float invoiceAmount
        Float gstAmount
        Float gstRate
        Boolean isGstInclusive
        Boolean isGstEligible
        Float paidAmount
        Float outstandingAmount
        String status
        String description
        DateTime createdAt
    }

    VendorPayment {
        String id PK
        String vendorInvoiceId FK
        Float amount
        DateTime paymentDate
        String method
        String reference
        String notes
        DateTime createdAt
    }
```

#### Key Indexes for Performance
To support rapid sub-millisecond queries across large datasets, the following composite and single-column indexes are maintained:
- `Invoice`: `@@index([customerId])`, `@@index([dueDate])`, `@@index([status])`
- `FollowUp`: `@@index([invoiceId])`
- `PaymentEntry`: `@@index([invoiceId])`
- `Expense`: `@@index([expenseDate])`
- `VendorInvoice`: `@@index([vendorId])`, `@@index([dueDate])`
- `VendorPayment`: `@@index([vendorInvoiceId])`

---

### Prisma & PostgreSQL Engine Adapter

The application employs Prisma 7's modern driver adapter architecture (`lib/db/prisma.ts`), eliminating cold-start overhead and connection pool exhaustion:

```typescript
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

### Server Actions & Concurrency Transactions

Mutations use Next.js Server Actions with atomic PostgreSQL transactions (`prisma.$transaction`) to prevent race conditions during payment settlements.

**Example: Payment Settlement Action (`app/invoices/[id]/payment/actions.ts`):**
```typescript
await prisma.$transaction([
  // 1. Record immutable payment ledger entry
  prisma.paymentEntry.create({
    data: {
      invoiceId,
      amount,
      method,
      reference,
      notes,
      paymentDate,
    },
  }),

  // 2. Synchronize invoice balance and status
  prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: newTotalPaid,
      outstandingAmount: newOutstanding,
      status: newStatus,
    },
  }),
])

// 3. Purge cache on dependent routes
revalidatePath(`/invoices/${invoiceId}`)
revalidatePath('/invoices')
revalidatePath('/dashboard')
```

---

### Export API Specification

- **Endpoint:** `GET /api/export`
- **Authentication:** Requires active NextAuth session (`401 Unauthorized` if unauthenticated).
- **Hard Limit:** Caps exports at `MAX_ROWS = 5000` to prevent memory exhaustion.
- **Parameters:**
  - `entity` (required): `'customers' | 'invoices' | 'collection' | 'vendors' | 'expenses' | 'vendor-invoices'`
  - `type` (required): `'excel' | 'pdf'`
  - `q` (optional): Full-text search term.
  - `status` (optional): Entity status filter (`PAID`, `UNPAID`, `OVERDUE`, `PARTIAL`).
  - `invoiceDateRange` / `dueDateRange` / `expenseDateRange` (optional): Preset strings (`this_month`, `last_month`, `last_30_days`, `this_year`, etc.).

---

## 🚀 Installation & Getting Started

### Prerequisites
- **Node.js:** `v20.x` or `v22.x` (LTS recommended)
- **Package Manager:** `npm` (v10+)
- **Database:** PostgreSQL (v14, v15, or v16) or hosted PostgreSQL instance (Supabase, Neon, AWS RDS)

### Environment Configuration

Create a `.env` file in the root directory:

```env
# PostgreSQL Connection String (Transaction Pooler or Direct)
DATABASE_URL="postgresql://username:password@localhost:5432/msme_cashflow?schema=public"

# NextAuth Secret (Generate via `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-super-secret-random-key"

# Canonical URL of the application
NEXTAUTH_URL="http://localhost:3000"
```

---

### Database Migration & Seeding

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Push Schema to Database:**
   ```bash
   npx prisma db push
   ```
   *(Or run migrations via `npx prisma migrate dev`)*

4. **Seed Database with Realistic Demo Data:**
   ```bash
   npx prisma db seed
   ```
   *The seed script populates 3 test users across roles, 20 customers across major Indian cities, 9 vendors, 14 expense categories, and over 150 realistic invoices, payments, follow-ups, and expenses spanning the last 90 days.*

---

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Default Demo Credentials

When seeded using `npx prisma db seed`, the system creates the following accounts (Password: `password123` for all):

| Role | Email | Password | Intended Use Case |
| :--- | :--- | :--- | :--- |
| **OWNER (Admin)** | `test@email.com` | `password123` | Full access to Executive Dashboard, Cash Flow Forecasting, and GST Leakage Audit |
| **ACCOUNTS** | `accounts@msme.com` | `password123` | Operational access to Billing, Payables Queue, and Vendor settlements |
| **SALES** | `sales@msme.com` | `password123` | Customer onboarding, invoice creation, and Collections Queue follow-ups |

---

### Running Test & Verification Scripts

The repository includes standalone TypeScript verification scripts in the `scripts/` directory to test core calculation logic and database assertions:

```bash
# Verify GST math (Inclusive vs Exclusive tax calculations)
npx -y tsx scripts/verify-gst-calculation.ts

# Verify Dashboard GST Aggregations and Net GST Payable metrics
npx -y tsx scripts/verify-gst-kpis.ts

# Verify Invoice Outstanding Balance & Payment Ledger transactions
npx -y tsx scripts/verify-invoice-calculation.ts

# Verify Database Mandatory Constraints
npx -y tsx scripts/verify-mandatory-invoice.ts

# Verify Optional & Nullable Field Handling
npx -y tsx scripts/verify-optional-invoice.ts
```

---

## 🛠️ Extension & Contribution Guidelines

### Adding a New Operational Entity
1. **Define Schema:** Add your model to `prisma/schema.prisma` with appropriate indexes and foreign keys.
2. **Migrate:** Run `npx prisma db push` or `npx prisma migrate dev --name add_new_entity`.
3. **Add Server Actions:** Implement validation and mutations inside an `actions.ts` file within your route folder. Always wrap updates affecting balances in `prisma.$transaction`.
4. **Register in Export Engine:** Add your entity mapping inside `app/api/export/route.ts` to automatically support Excel and PDF report downloads.
5. **Update Navigation:** Register your route inside the `navGroups` array in `components/Sidebar.tsx`.

### Code Conventions
- **Server Components by Default:** Keep page components as React Server Components (`RSC`) for optimal data fetching directly via Prisma. Use `'use client'` only where local state, forms, or browser events are required.
- **Path Revalidation:** Always invoke `revalidatePath('/your-route')` after mutating state in Server Actions to ensure UI freshness without manual browser refreshes.
- **Theme Support:** Maintain dual-theme compatibility by pairing standard Tailwind classes with dark mode variants (e.g., `bg-white dark:bg-slate-900 border-border text-foreground`).

---

## 📄 License & Intellectual Property

This project is proprietary software developed for MSME financial operations. All rights reserved. For commercial licensing or enterprise customization, contact the engineering team.
