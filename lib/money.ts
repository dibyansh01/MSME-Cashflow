import { Prisma } from "@prisma/client";

export const Decimal = Prisma.Decimal;
export type Decimal = Prisma.Decimal;

export type MoneyInput = string | number | Prisma.Decimal;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

/**
 * Normalises input (number, string, or Decimal) into a canonical Prisma.Decimal.
 * Handles Indian comma-separated strings (e.g. "1,23,456.78", "₹ 1,23,456.78", "-₹500.50").
 * Throws MoneyError on empty, non-finite, or malformed inputs.
 */
export function d(val: MoneyInput | null | undefined): Prisma.Decimal {
  if (val === null || val === undefined) {
    throw new MoneyError("Cannot convert null or undefined to Decimal");
  }

  if (val instanceof Prisma.Decimal) {
    return val;
  }

  if (typeof val === "number") {
    if (!Number.isFinite(val)) {
      throw new MoneyError(`Cannot convert non-finite number (${val}) to Decimal`);
    }
    return new Prisma.Decimal(val.toString());
  }

  if (typeof val === "string") {
    let cleaned = val.trim();
    if (!cleaned) {
      throw new MoneyError("Cannot parse empty string as Decimal");
    }

    let isNeg = false;
    // Strip leading currency symbol before parenthetical check (e.g. "₹(1,234.56)")
    cleaned = cleaned.replace(/^[₹\s]|^(?:INR|Rs\.?)\s*/i, "").trim();

    // Parenthetical accounting negative: (1,234.56) or (₹1,234.56)
    if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
      isNeg = true;
      cleaned = cleaned.slice(1, -1).trim();
    }

    // Strip currency symbols (₹, INR, Rs, Rs.), commas, and whitespace
    cleaned = cleaned.replace(/[₹\s,]|(?:INR|Rs\.?)/gi, "");

    if (cleaned.startsWith("-")) {
      if (isNeg) {
        throw new MoneyError(`Malformed currency string with double negative: "${val}"`);
      }
      isNeg = true;
      cleaned = cleaned.slice(1).trim();
    } else if (cleaned.startsWith("+")) {
      if (isNeg) {
        throw new MoneyError(`Malformed currency string: "${val}"`);
      }
      cleaned = cleaned.slice(1).trim();
    }

    // Strictly validate unsigned decimal (supports integers, decimals, and leading dots like ".50")
    if (!cleaned || !/^(\d+(\.\d*)?|\.\d+)$/.test(cleaned)) {
      throw new MoneyError(`Malformed currency string: "${val}"`);
    }

    if (isNeg) {
      cleaned = `-${cleaned}`;
    }

    try {
      return new Prisma.Decimal(cleaned);
    } catch {
      throw new MoneyError(`Failed to parse Decimal from: "${val}"`);
    }
  }

  throw new MoneyError(`Unsupported money input type: ${typeof val}`);
}

/**
 * Returns a Decimal representing 0.
 */
export function zero(): Prisma.Decimal {
  return new Prisma.Decimal(0);
}

/**
 * Exact addition (unrounded).
 */
export function add(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  return d(a).plus(d(b));
}

/**
 * Exact subtraction (unrounded).
 */
export function sub(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  return d(a).minus(d(b));
}

/**
 * Exact multiplication (unrounded).
 */
export function mul(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  return d(a).times(d(b));
}

/**
 * Exact division (unrounded). Throws MoneyError on division by zero.
 */
export function div(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  const divisor = d(b);
  if (divisor.isZero()) {
    throw new MoneyError("Division by zero in money calculation");
  }
  return d(a).dividedBy(divisor);
}

/**
 * Exact percentage calculation (unrounded). E.g. pct(1000, 18) = 180.
 */
export function pct(amount: MoneyInput, percentage: MoneyInput): Prisma.Decimal {
  return d(amount).times(d(percentage)).dividedBy(100);
}

/**
 * General rounding function with explicit decimal places and rounding mode.
 */
export function round(
  val: MoneyInput,
  decimals = 2,
  roundingMode = Prisma.Decimal.ROUND_HALF_UP
): Prisma.Decimal {
  return d(val).toDecimalPlaces(decimals, roundingMode);
}

/**
 * Indian Statutory & Commercial Rounding (Round Half Up to 2 decimal places).
 * Mandated for Indian GST (Section 170 CGST Act) and commercial invoicing.
 */
export function roundHalfUp2(val: MoneyInput): Prisma.Decimal {
  return d(val).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Banker's Rounding / Round-Half-to-Even to 2 decimal places (IEEE 754 / ISO convention).
 * Used in banking and financial portfolios to eliminate positive accumulation bias.
 */
export function roundBankers2(val: MoneyInput): Prisma.Decimal {
  return d(val).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_EVEN);
}

export const roundHalfEven2 = roundBankers2;

/**
 * Apportions an amount across ratios using the largest-remainder method.
 * Guarantees that sum(parts) === total down to the paisa (0 paise leakage).
 * Standard banking best practice for payment/discount/tax multi-part distributions.
 */
export function allocate(total: MoneyInput, ratios: number[]): Prisma.Decimal[] {
  const dTotal = d(total);
  if (!ratios || ratios.length === 0) {
    throw new MoneyError("Ratios array must not be empty");
  }

  let sumRatio = 0;
  for (const r of ratios) {
    if (r < 0) {
      throw new MoneyError(`Ratio cannot be negative: ${r}`);
    }
    sumRatio += r;
  }

  if (sumRatio <= 0) {
    throw new MoneyError("Sum of ratios must be greater than zero");
  }

  const isNeg = dTotal.isNegative();
  const absTotal = dTotal.abs();
  // Work in paise (integer cents)
  const totalPaise = absTotal.times(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);

  const items = ratios.map((r, idx) => {
    const exact = totalPaise.times(r).dividedBy(sumRatio);
    const base = exact.floor();
    const rem = exact.minus(base);
    return { idx, base, rem };
  });

  const allocatedPaise = items.reduce((acc, it) => acc.plus(it.base), new Prisma.Decimal(0));
  const shortfall = totalPaise.minus(allocatedPaise).toNumber();

  // Sort items by remainder descending, preserving original index on ties
  const sorted = [...items].sort((a, b) => {
    const cmp = b.rem.comparedTo(a.rem);
    return cmp !== 0 ? cmp : a.idx - b.idx;
  });

  for (let i = 0; i < shortfall; i++) {
    sorted[i].base = sorted[i].base.plus(1);
  }

  return items.map((it) => {
    const val = it.base.dividedBy(100);
    return isNeg ? val.negated() : val;
  });
}

// Equality and comparison helpers
export function eq(a: MoneyInput, b: MoneyInput): boolean {
  return d(a).equals(d(b));
}

export function gt(a: MoneyInput, b: MoneyInput): boolean {
  return d(a).greaterThan(d(b));
}

export function gte(a: MoneyInput, b: MoneyInput): boolean {
  return d(a).greaterThanOrEqualTo(d(b));
}

export function lt(a: MoneyInput, b: MoneyInput): boolean {
  return d(a).lessThan(d(b));
}

export function lte(a: MoneyInput, b: MoneyInput): boolean {
  return d(a).lessThanOrEqualTo(d(b));
}

export function isZero(val: MoneyInput): boolean {
  return d(val).isZero();
}

export function isPositive(val: MoneyInput): boolean {
  return d(val).greaterThan(0);
}

export function isNegative(val: MoneyInput): boolean {
  return d(val).lessThan(0);
}

/**
 * Formats a money value using Indian numbering format (e.g. ₹1,23,456.78).
 * Accepts optional parameters to omit currency symbol or adjust decimal places.
 */
export function formatINR(
  val: MoneyInput,
  options?: {
    symbol?: boolean;
    decimals?: number;
  }
): string {
  const decimals = options?.decimals ?? 2;
  const showSymbol = options?.symbol ?? true;
  const rounded = roundHalfUp2(val);
  // Prevent -₹0.00 for small negative values that round to 0
  const normalized = rounded.isZero() ? zero() : rounded;
  const formattedDecimalStr = normalized.toFixed(decimals);

  const formatter = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // reason: V8 Intl accepts numeric string directly, avoiding IEEE-754 precision loss
  return formatter.format(formattedDecimalStr as unknown as number);
}
