import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";
import { expo } from "@better-auth/expo";

const trustedOrigins = env.CLIENT_ORIGIN.split(",");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [expo()],
  trustedOrigins,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  user: {
    additionalFields: {
      points: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

export type AuthContextVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
