# 13-Week Cash Forecast Domain Model

> **Status:** Specification (implemented in Phase 4)

## Model Overview
- **Objective:** Forecast weekly cash balances over a 13-week horizon for Indian MSME owners.
- **Inflows:** Based on customer invoice balances adjusted by customer median payment lag and promise history.
- **Outflows:** Based on vendor invoices ranked by statutory clocks (43B(h), 180-day ITC) and operational commitments (Salary, Rent, EMI, Tax).
