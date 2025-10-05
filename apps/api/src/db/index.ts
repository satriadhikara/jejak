import { drizzle } from "drizzle-orm/bun-sql";
import { env } from "@/lib/env";

const db = drizzle(env.DATABASE_URL);

export default db;
