# docs/domain/compliance-rules.md

> **Status: DRAFT — NOT YET REVIEWED BY A CA.** Agents must not change rules here, and no rule may appear in user-facing text until its **CA review** is `approved`. Every rule needs a source link and an effective date. If law changes, add a *new* version; don't edit history.

| ID | Rule (plain language) | Source (as of 2 Oct 2026) | Effective | CA review | Product use |
|---|---|---|---|---|---|
| R1 | A buyer's deduction for amounts owed to **micro/small** suppliers depends on actual payment within the legal limit: **15 days** with no written agreement; the agreed period, **capped at 45 days**, with one. Amounts paid after the limit are deductible only in the year of actual payment. | Finance Ministry reply (21 Jul 2026) via TaxGuru; BUSY explainer — links in strategy report [S3] | AY 2024-25 onward; from 1 Apr 2026 as s.37(2)(g) of the Income-tax Act, 2025 | **pending** | 43B(h) clock (D5) |
| R2 | The Ministry's reply says the rule covers **micro and small** enterprises; some commentary mentions MSMEs generally. Treat **medium as not covered** unless a CA says otherwise. | [S3] | — | **pending** | Vendor `msmeCategory` |
| R3 | Whether **trader**-type MSEs are covered is debated in practice. Provide a per-vendor `coveredBy43Bh` override; default for traders = "unknown — ask CA". | General practitioner commentary — not verified | — | **pending** | Vendor flag |
| R4 | Payment made **before the income-tax return due date** may preserve the deduction for the year the expense was incurred. Show as a *note*, never as a calculation. | [S3] | — | **pending** | Note on clock UI |
| R5 | Interest payable to an MSE supplier under the MSMED Act is **not tax-deductible**. | [S3] | — | **pending** | Informational |
| R6 | ITC on a purchase must be **reversed with interest** if the supplier isn't paid within **180 days** of the invoice date; re-claimable on payment; partial payment → proportionate reversal. | TaxGuru / TaxTMI — links in strategy report [S4] | Existing GST law (s.16(2) provisos, Rule 37) | **pending** | ITC 180-day clock |
| R7 | ITC availability also depends on conditions such as the supplier having filed and the invoice appearing in GSTR-2B. **Not verified in this project** — product states a caveat and does not compute eligibility. | Needs CA confirmation | — | **pending** | Caveat text |
| R8 | The MSMED (Amendment) Act 2026 received assent on 13 Aug 2026; **commencement of specific provisions may differ**. The product must not present timelines or penalties under it as in force until a CA/lawyer confirms commencement. | [S6] | Assent 13 Aug 2026 | **pending** | Informational only |

## Required UI disclaimer
"This tool highlights payment deadlines to help you plan. It is not tax, legal or accounting advice. Confirm treatment with your CA."

## Change procedure
1. Human proposes a rule change with a source link.
2. CA reviews; status becomes `approved` with name and date.
3. Agent updates typed config and tests in a single PR referencing the rule ID.
