import { describe, it, expect, vi } from "vitest";
import { formatLogEntry, sanitize, logger } from "@/lib/logger";

describe("lib/logger", () => {
  it("formats log entries with ISO timestamp and level", () => {
    const entry = formatLogEntry("info", "Test log message", { orgId: "org-1" });
    expect(entry.level).toBe("info");
    expect(entry.message).toBe("Test log message");
    expect(entry.timestamp).toBeDefined();
    expect(entry.meta?.orgId).toBe("org-1");
  });

  it("redacts sensitive keys (password, secret, token, authorization)", () => {
    const sensitive = {
      user: "alice",
      password: "plain-password",
      apiSecret: "12345",
      jwtToken: "xyz",
      nested: {
        authorization: "Bearer 123",
        safe: "public-value",
      },
    };

    const sanitized = sanitize(sensitive) as Record<string, any>;
    expect(sanitized.user).toBe("alice");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.apiSecret).toBe("[REDACTED]");
    expect(sanitized.jwtToken).toBe("[REDACTED]");
    expect(sanitized.nested.authorization).toBe("[REDACTED]");
    expect(sanitized.nested.safe).toBe("public-value");
  });

  it("invokes logger without throwing", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    expect(() => logger.info("Server initialized", { port: 3000 })).not.toThrow();
    spy.mockRestore();
  });
});
