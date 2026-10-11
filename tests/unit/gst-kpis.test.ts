import { describe, it, expect } from "vitest";

interface GstItem {
  gstAmount: number | null;
  isGstEligible?: boolean;
}

export function calculateGstKpiSummary({
  salesInvoices,
  vendorInvoices,
  expenses,
}: {
  salesInvoices: GstItem[];
  vendorInvoices: GstItem[];
  expenses: GstItem[];
}) {
  const gstCollected = salesInvoices.reduce((sum, inv) => sum + (inv.gstAmount || 0), 0);

  let gstPaidClaimable = 0;
  let gstPaidNonClaimable = 0;

  for (const inv of vendorInvoices) {
    const amount = inv.gstAmount || 0;
    if (inv.isGstEligible) {
      gstPaidClaimable += amount;
    } else {
      gstPaidNonClaimable += amount;
    }
  }

  for (const exp of expenses) {
    const amount = exp.gstAmount || 0;
    if (exp.isGstEligible) {
      gstPaidClaimable += amount;
    } else {
      gstPaidNonClaimable += amount;
    }
  }

  const netGstPayable = gstCollected - gstPaidClaimable;

  return {
    gstCollected,
    gstPaidClaimable,
    gstPaidNonClaimable,
    netGstPayable,
  };
}

describe("GST KPI Calculations (ported from verify-gst-kpis.ts)", () => {
  it("calculates claimable, non-claimable, and net payable accurately", () => {
    const summary = calculateGstKpiSummary({
      salesInvoices: [{ gstAmount: 180 }],
      vendorInvoices: [{ gstAmount: 90, isGstEligible: true }],
      expenses: [
        { gstAmount: 10, isGstEligible: false },
        { gstAmount: 18, isGstEligible: true },
      ],
    });

    expect(summary.gstCollected).toBe(180);
    expect(summary.gstPaidClaimable).toBe(108); // 90 + 18
    expect(summary.gstPaidNonClaimable).toBe(10);
    expect(summary.netGstPayable).toBe(72); // 180 - 108
  });

  it("handles empty arrays cleanly", () => {
    const summary = calculateGstKpiSummary({
      salesInvoices: [],
      vendorInvoices: [],
      expenses: [],
    });

    expect(summary.gstCollected).toBe(0);
    expect(summary.gstPaidClaimable).toBe(0);
    expect(summary.gstPaidNonClaimable).toBe(0);
    expect(summary.netGstPayable).toBe(0);
  });

  it("handles null gstAmount entries without throwing", () => {
    const summary = calculateGstKpiSummary({
      salesInvoices: [{ gstAmount: null }, { gstAmount: 50 }],
      vendorInvoices: [{ gstAmount: null, isGstEligible: true }],
      expenses: [{ gstAmount: null, isGstEligible: false }],
    });

    expect(summary.gstCollected).toBe(50);
    expect(summary.gstPaidClaimable).toBe(0);
    expect(summary.gstPaidNonClaimable).toBe(0);
    expect(summary.netGstPayable).toBe(50);
  });

  it("reflects negative net payable when input GST exceeds collected output GST", () => {
    const summary = calculateGstKpiSummary({
      salesInvoices: [{ gstAmount: 50 }],
      vendorInvoices: [{ gstAmount: 100, isGstEligible: true }],
      expenses: [],
    });

    expect(summary.netGstPayable).toBe(-50);
  });
});
