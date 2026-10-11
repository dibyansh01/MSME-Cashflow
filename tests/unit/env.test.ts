import { describe, it, expect } from "vitest";
import { parseEnv } from "@/lib/env";

describe("lib/env", () => {
  const validBase = {
    DATABASE_URL: "postgresql://postgres:pass@localhost:5432/testdb",
    NEXTAUTH_SECRET: "test-secret-at-least-some-chars",
  };

  it("parses valid environment with default URL and NODE_ENV", () => {
    const parsed = parseEnv(validBase);
    expect(parsed.DATABASE_URL).toBe(validBase.DATABASE_URL);
    expect(parsed.NEXTAUTH_SECRET).toBe(validBase.NEXTAUTH_SECRET);
    expect(parsed.NEXTAUTH_URL).toBe("http://localhost:3000");
    expect(parsed.NODE_ENV).toBe("development");
  });

  it("accepts custom NEXTAUTH_URL and NODE_ENV", () => {
    const parsed = parseEnv({
      ...validBase,
      NEXTAUTH_URL: "https://cashflow.example.com",
      NODE_ENV: "production",
    });
    expect(parsed.NEXTAUTH_URL).toBe("https://cashflow.example.com");
    expect(parsed.NODE_ENV).toBe("production");
  });

  it("fails when DATABASE_URL is missing", () => {
    expect(() =>
      parseEnv({
        NEXTAUTH_SECRET: "test-secret",
      })
    ).toThrow(/DATABASE_URL is required/);
  });

  it("fails when NEXTAUTH_SECRET is missing", () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: "postgresql://localhost:5432/testdb",
      })
    ).toThrow(/NEXTAUTH_SECRET is required/);
  });

  it("fails when NEXTAUTH_URL is not a valid URL", () => {
    expect(() =>
      parseEnv({
        ...validBase,
        NEXTAUTH_URL: "not-a-valid-url",
      })
    ).toThrow(/NEXTAUTH_URL must be a valid URL/);
  });
});
