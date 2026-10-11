import { describe, it, expect } from "vitest";

describe("Smoke Test", () => {
  it("verifies Vitest runs and asserts successfully", () => {
    expect(1 + 1).toBe(2);
  });

  it("verifies path aliases resolve properly", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });
});
