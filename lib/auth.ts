import { betterAuth } from "better-auth";
import { Pool } from "pg";

const baseURL = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [baseURL],
  advanced: {
    useSecureCookies: baseURL.startsWith("https://"),
  },
  database: new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
