import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL cannot be empty"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET cannot be empty"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => {
        const field = i.path.join(".");
        const isMissing = i.message.includes("expected string, received undefined");
        const msg = isMissing ? `${field} is required` : i.message;
        return `  - ${field}: ${msg}`;
      })
      .join("\n");
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  return result.data;
}

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = parseEnv();
  }
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
