import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  CLIENT_ORIGIN: z.string().min(1),
  PORT: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(Bun.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "<root>";
      return `  • ${path}: ${issue.message}`;
    })
    .join("\n");

  console.error(
    ["\n[env] Failed to load configuration:", details, ""].join("\n"),
  );
  process.exit(1);
}

export const env = {
  ...parsedEnv.data,
  PORT: parsedEnv.data.PORT ? Number(parsedEnv.data.PORT) : undefined,
};
