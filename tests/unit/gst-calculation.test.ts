import { describe, it, expect } from "vitest";
import { calculateGstAmounts } from "@/lib/utils/invoice";

describe("GST Calculation Logic (lib/utils/invoice)", () => {
  it("calculates GST exclusive amounts correctly (1000 + 18%)", () => {
    const result = calculateGstAmounts({
      amountEntered: 1000,
      gstRate: 18,
      isGstInclusive: false,
    });
    expect(result.baseAmount).toBe(1000);
    expect(result.gstAmount).toBe(180);
    expect(result.totalAmount).toBe(1180);
  });

  it("calculates GST inclusive amounts correctly (1180 incl 18%)", () => {
    const result = calculateGstAmounts({
      amountEntered: 1180,
      gstRate: 18,
      isGstInclusive: true,
    });
    expect(result.baseAmount).toBeCloseTo(1000, 2);
    expect(result.gstAmount).toBeCloseTo(180, 2);
    expect(result.totalAmount).toBe(1180);
  });

  it("handles zero or null GST rate without adding tax", () => {
    const nullRateResult = calculateGstAmounts({
      amountEntered: 1000,
      gstRate: null,
      isGstInclusive: false,
    });
    expect(nullRateResult.baseAmount).toBe(1000);
    expect(nullRateResult.gstAmount).toBe(0);
    expect(nullRateResult.totalAmount).toBe(1000);

    const zeroRateResult = calculateGstAmounts({
      amountEntered: 1000,
      gstRate: 0,
      isGstInclusive: false,
    });
    expect(zeroRateResult.baseAmount).toBe(1000);
    expect(zeroRateResult.gstAmount).toBe(0);
    expect(zeroRateResult.totalAmount).toBe(1000);
  });

  it("handles standard GST tiers (5%, 12%, 18%, 28%)", () => {
    const tiers = [
      { rate: 5, expectedGst: 50, expectedTotal: 1050 },
      { rate: 12, expectedGst: 120, expectedTotal: 1120 },
      { rate: 18, expectedGst: 180, expectedTotal: 1180 },
      { rate: 28, expectedGst: 280, expectedTotal: 1280 },
    ];

    for (const tier of tiers) {
      const res = calculateGstAmounts({
        amountEntered: 1000,
        gstRate: tier.rate,
        isGstInclusive: false,
      });
      expect(res.gstAmount).toBeCloseTo(tier.expectedGst, 2);
      expect(res.totalAmount).toBeCloseTo(tier.expectedTotal, 2);
    }
  });

  it("handles zero amount entered", () => {
    const result = calculateGstAmounts({
      amountEntered: 0,
      gstRate: 18,
      isGstInclusive: false,
    });
    expect(result.baseAmount).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
  });
});
