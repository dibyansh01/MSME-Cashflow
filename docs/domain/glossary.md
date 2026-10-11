# Domain Glossary — MSME CashFlow

> **Standing Rule (`AGENTS.md`):** Use canonical domain terms everywhere (code, database models, API, UI, documentation). Do not invent synonyms like *client*, *supplier*, *bill*, or *voucher*.

---

## Canonical Domain Terms

### 1. Parties
- **Customer:** A B2B counterparty purchasing goods or services on credit from the MSME.
- **Vendor:** A B2B counterparty supplying raw materials, inventory, or operational services to the MSME.

### 2. Commercial Documents & Balances
- **Invoice (Sales Invoice):** A credit billing document issued to a customer. Contains `invoiceAmount` (base), `gstAmount`, and total outstanding.
- **Vendor Invoice (Purchase Invoice):** A billing document received from a vendor with credit due dates and GST eligibility flags.
- **Outstanding:** The net unpaid balance of an invoice: `invoice total - allocations - adjustments - credit notes`. Outstanding is computed at read time, never stored as a stagnant status.
- **Status:** Computed state of an invoice: `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`, `WRITTEN_OFF`.

### 3. Cash Inflows & Allocations
- **Receipt:** An actual cash inflow received from a customer (via Bank, UPI, Cheque, Cash). Can be allocated across multiple invoices or held on-account.
- **Receipt Allocation:** The many-to-many junction record linking a `Receipt` to a specific `Invoice` for a designated amount.
- **Adjustment:** Non-cash adjustments altering invoice balance (e.g., TDS deducted at source, cash discount, short payment, bad debt write-off).
- **Credit Note:** A formal reduction in the receivable balance issued to a customer.

### 4. Collections Workflow
- **Promise (Promise-to-Pay):** A customer-level commitment indicating an agreed payment amount and expected payment date (`promisedFor`), recorded via call, WhatsApp, email, or visit.
- **Promise Status:** `OPEN`, `KEPT` (receipt arrived on or before promised date), `PARTIAL`, `BROKEN`, `CANCELLED`.
- **Collector:** A user role assigned to manage collections for designated customer accounts.

### 5. Cash Outflows & Forecasting
- **Commitment:** A recurring or known operational cash outflow required for forecast planning (e.g., Salary, Rent, Loan EMI, GST payment, Advance Tax).
- **Obligation:** A legal or statutory vendor payment clock governed by compliance rules (e.g., Section 43B(h) 15/45-day payment deadline, GST 180-day ITC reversal clock).
- **Weekly Cash Plan:** The consolidated weekly plan (generated Mondays) advising the business owner on whom to collect from first, which vendor bills to pay, and projected 13-week cash liquidity.
