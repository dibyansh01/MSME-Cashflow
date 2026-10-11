import { describe, it, expect } from "vitest";
import {
  d,
  zero,
  add,
  sub,
  mul,
  div,
  pct,
  roundHalfUp2,
  roundBankers2,
  allocate,
  eq,
  gt,
  gte,
  lt,
  lte,
  isZero,
  isPositive,
  isNegative,
  formatINR,
  MoneyError,
  Decimal,
} from "../../lib/money";

describe("lib/money.ts — Canonical Money Arithmetic", () => {
  describe("Creation and Parsing (d, zero)", () => {
    it("creates Decimal from number, string, and existing Decimal", () => {
      const fromNum = d(100.5);
      const fromStr = d("100.5");
      const fromDec = d(new Decimal("100.5"));

      expect(fromNum.toString()).toBe("100.5");
      expect(fromStr.toString()).toBe("100.5");
      expect(fromDec.toString()).toBe("100.5");
      expect(eq(fromNum, fromStr)).toBe(true);
      expect(eq(fromStr, fromDec)).toBe(true);
    });

    it("parses Indian number formatting with commas and currency symbols", () => {
      expect(d("1,23,456.78").toString()).toBe("123456.78");
      expect(d("₹ 1,23,456.78").toString()).toBe("123456.78");
      expect(d(" ₹1,23,456.78 ").toString()).toBe("123456.78");
      expect(d("12,34,56,789.50").toString()).toBe("123456789.5");
    });

    it("parses negative amounts with Indian formatting", () => {
      expect(d("-1,23,456.78").toString()).toBe("-123456.78");
      expect(d("-₹1,23,456.78").toString()).toBe("-123456.78");
      expect(d("₹ -1,23,456.78").toString()).toBe("-123456.78");
    });

    it("parses leading decimal point notation (.50, -.50, -₹.50)", () => {
      expect(d(".50").toString()).toBe("0.5");
      expect(d("-.50").toString()).toBe("-0.5");
      expect(d("-₹.50").toString()).toBe("-0.5");
      expect(d("₹ .50").toString()).toBe("0.5");
    });

    it("parses parenthetical accounting negative formats ((1,23,456.78), ₹(1,23,456.78))", () => {
      expect(d("(1,23,456.78)").toString()).toBe("-123456.78");
      expect(d("₹(1,23,456.78)").toString()).toBe("-123456.78");
      expect(d("(₹1,23,456.78)").toString()).toBe("-123456.78");
    });

    it("creates zero via zero()", () => {
      const z = zero();
      expect(z.toString()).toBe("0");
      expect(isZero(z)).toBe(true);
    });

    it("throws MoneyError on invalid input strings or non-finite numbers", () => {
      expect(() => d("invalid")).toThrow(MoneyError);
      expect(() => d("")).toThrow(MoneyError);
      expect(() => d("   ")).toThrow(MoneyError);
      expect(() => d(NaN)).toThrow(MoneyError);
      expect(() => d(Infinity)).toThrow(MoneyError);
      expect(() => d(".")).toThrow(MoneyError);
      expect(() => d("2026-10-11")).toThrow(MoneyError);
      expect(() => d("12-34")).toThrow(MoneyError);
      expect(() => d("--100")).toThrow(MoneyError);
      expect(() => d("-₹-100")).toThrow(MoneyError);
      expect(() => d("(-100)")).toThrow(MoneyError);
      expect(() => d("1.2.3")).toThrow(MoneyError);
    });
  });

  describe("Exact Arithmetic (add, sub, mul, div, pct)", () => {
    it("avoids IEEE-754 floating point drift (0.1 + 0.2 === 0.3)", () => {
      const sum = add("0.1", "0.2");
      expect(sum.toString()).toBe("0.3");
      expect(eq(sum, "0.3")).toBe(true);
    });

    it("subtracts accurately", () => {
      const diff = sub("1000", "250.75");
      expect(diff.toString()).toBe("749.25");
    });

    it("multiplies accurately without premature rounding", () => {
      const product = mul("15", "100.255");
      expect(product.toString()).toBe("1503.825");
    });

    it("divides accurately and throws MoneyError on division by zero", () => {
      const quotient = div("100", "4");
      expect(quotient.toString()).toBe("25");

      expect(() => div("100", "0")).toThrow(MoneyError);
      expect(() => div("100", 0)).toThrow(MoneyError);
    });

    it("computes percentage as exact Decimal without premature rounding", () => {
      expect(pct("1000", 18).toString()).toBe("180");
      expect(pct("1234.56", 18).toString()).toBe("222.2208");
    });
  });

  describe("Comparisons", () => {
    it("compares equality, greater than, less than accurately", () => {
      expect(eq("100.00", "100")).toBe(true);
      expect(gt("100.01", "100.00")).toBe(true);
      expect(gte("100.00", "100.00")).toBe(true);
      expect(lt("99.99", "100.00")).toBe(true);
      expect(lte("100.00", "100.00")).toBe(true);
    });

    it("detects zero, positive, and negative values", () => {
      expect(isZero("0.00")).toBe(true);
      expect(isZero("0")).toBe(true);
      expect(isPositive("0.01")).toBe(true);
      expect(isPositive("0")).toBe(false);
      expect(isNegative("-0.01")).toBe(true);
      expect(isNegative("0")).toBe(false);
    });
  });

  describe("Rounding Modes & Financial Standards", () => {
    describe("Commercial / Indian Statutory Rounding (roundHalfUp2)", () => {
      it("rounds half-up at 2 decimal places per Indian commercial standards", () => {
        expect(roundHalfUp2("1234.565").toString()).toBe("1234.57");
        expect(roundHalfUp2("1234.564").toString()).toBe("1234.56");
        expect(roundHalfUp2("1234.566").toString()).toBe("1234.57");
        expect(roundHalfUp2("-1234.565").toString()).toBe("-1234.57");
        expect(roundHalfUp2("-1234.564").toString()).toBe("-1234.56");
      });
    });

    describe("Banker's Rounding / Round-Half-to-Even (roundBankers2)", () => {
      it("rounds half to even to eliminate statistical accumulation bias", () => {
        // Even predecessor remains even
        expect(roundBankers2("1234.565").toString()).toBe("1234.56");
        // Odd predecessor rounds up to even
        expect(roundBankers2("1234.575").toString()).toBe("1234.58");
        expect(roundBankers2("1234.585").toString()).toBe("1234.58");
        expect(roundBankers2("1234.595").toString()).toBe("1234.6");
      });
    });

    describe("Zero-loss Apportionment / Allocation (allocate)", () => {
      it("apportions amounts with exact penny preservation (sum of parts === total)", () => {
        // Splitting 100 into 3 parts would yield 33.3333... each.
        // In financial accounting, 33.34 + 33.33 + 33.33 = 100.00 with 0 paise lost.
        const parts = allocate("100", [1, 1, 1]);
        expect(parts).toHaveLength(3);
        expect(parts[0].toString()).toBe("33.34");
        expect(parts[1].toString()).toBe("33.33");
        expect(parts[2].toString()).toBe("33.33");

        const totalSum = parts.reduce((acc, p) => add(acc, p), zero());
        expect(eq(totalSum, "100.00")).toBe(true);
      });

      it("apportions weighted payments across invoices exactly", () => {
        // Splitting ₹1,000 across ratios 1:2:3
        const parts = allocate("1000", [1, 2, 3]);
        expect(parts[0].toString()).toBe("166.67");
        expect(parts[1].toString()).toBe("333.33");
        expect(parts[2].toString()).toBe("500");

        const totalSum = parts.reduce((acc, p) => add(acc, p), zero());
        expect(eq(totalSum, "1000.00")).toBe(true);
      });
    });
  });

  describe("Mandated Spec Calculations (P1-T1)", () => {
    it("calculates 18% GST on ₹1,234.56", () => {
      const invoiceAmount = "1234.56";
      const exactTax = pct(invoiceAmount, 18);
      expect(exactTax.toString()).toBe("222.2208");

      const roundedTax = roundHalfUp2(exactTax);
      expect(roundedTax.toString()).toBe("222.22");
    });

    it("performs inclusive GST back-calculation with zero balance discrepancy", () => {
      // Gross inclusive invoice = ₹1,234.56 at 18% GST
      const gross = d("1234.56");
      const base = roundHalfUp2(div(gross, "1.18"));
      expect(base.toString()).toBe("1046.24");

      // Residual tax calculation guarantees gross = base + tax
      const gst = sub(gross, base);
      expect(gst.toString()).toBe("188.32");

      const reconstructedTotal = add(base, gst);
      expect(eq(reconstructedTotal, gross)).toBe(true);
      expect(reconstructedTotal.toString()).toBe("1234.56");
    });

    it("preserves exact precision over 10,000 accumulation iterations", () => {
      // 10,000 increments of ₹0.01 must equal exactly ₹100.00
      let total = zero();
      const increment = d("0.01");
      for (let i = 0; i < 10000; i++) {
        total = add(total, increment);
      }
      expect(total.toString()).toBe("100");
      expect(roundHalfUp2(total).toString()).toBe("100");
    });
  });

  describe("Indian Currency Formatting (formatINR)", () => {
    it("formats positive values with Indian commas and rupee symbol", () => {
      expect(formatINR("123456.78")).toBe("₹1,23,456.78");
      expect(formatINR(123456.78)).toBe("₹1,23,456.78");
      expect(formatINR("123456789.50")).toBe("₹12,34,56,789.50");
      expect(formatINR("100")).toBe("₹100.00");
    });

    it("formats zero correctly", () => {
      expect(formatINR(0)).toBe("₹0.00");
      expect(formatINR("0")).toBe("₹0.00");
    });

    it("formats negative values correctly", () => {
      expect(formatINR("-123456.78")).toBe("-₹1,23,456.78");
      expect(formatINR("-500.5")).toBe("-₹500.50");
    });

    it("supports formatting without rupee symbol when symbol: false", () => {
      expect(formatINR("123456.78", { symbol: false })).toBe("1,23,456.78");
      expect(formatINR("-123456.78", { symbol: false })).toBe("-1,23,456.78");
    });

    it("does not format small negative fractions as -₹0.00", () => {
      expect(formatINR("-0.004")).toBe("₹0.00");
      expect(formatINR("-0.0001")).toBe("₹0.00");
      expect(formatINR("-0.004", { symbol: false })).toBe("0.00");
    });
  });
});
