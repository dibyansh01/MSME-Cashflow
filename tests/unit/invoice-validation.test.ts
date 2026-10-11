import { describe, it, expect } from "vitest";

describe("Invoice Number and Validation Logic", () => {
  function validateInvoiceInput(data: {
    vendorId?: string;
    invoiceNo?: string;
    invoiceDate?: string;
    dueDate?: string;
    amount?: number;
  }) {
    if (!data.vendorId || !data.invoiceNo || !data.invoiceDate || !data.dueDate) {
      return { valid: false, error: "Please fill in all required fields" };
    }
    if (typeof data.amount !== "number" || isNaN(data.amount) || data.amount <= 0) {
      return { valid: false, error: "Amount must be a positive number" };
    }
    return { valid: true };
  }

  function generateVendorInvoiceNumber(prefix = "VINV", timestamp = Date.now()) {
    return `${prefix}-${timestamp}`;
  }

  it("fails when invoiceNo is missing or empty", () => {
    const result = validateInvoiceInput({
      vendorId: "vendor-123",
      invoiceNo: "",
      invoiceDate: "2026-10-11",
      dueDate: "2026-11-10",
      amount: 1000,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Please fill in all required fields");
  });

  it("succeeds when a valid invoiceNo is provided", () => {
    const result = validateInvoiceInput({
      vendorId: "vendor-123",
      invoiceNo: "INV-2026-001",
      invoiceDate: "2026-10-11",
      dueDate: "2026-11-10",
      amount: 1000,
    });
    expect(result.valid).toBe(true);
  });

  it("generates a formatted invoice number with prefix and timestamp", () => {
    const fixedTime = 1760000000000;
    const generated = generateVendorInvoiceNumber("VINV", fixedTime);
    expect(generated).toBe("VINV-1760000000000");
    expect(generated).toMatch(/^VINV-\d+$/);
  });

  it("fails when amount is zero or negative", () => {
    expect(
      validateInvoiceInput({
        vendorId: "vendor-123",
        invoiceNo: "INV-001",
        invoiceDate: "2026-10-11",
        dueDate: "2026-11-10",
        amount: 0,
      }).valid
    ).toBe(false);

    expect(
      validateInvoiceInput({
        vendorId: "vendor-123",
        invoiceNo: "INV-001",
        invoiceDate: "2026-10-11",
        dueDate: "2026-11-10",
        amount: -500,
      }).valid
    ).toBe(false);
  });
});
