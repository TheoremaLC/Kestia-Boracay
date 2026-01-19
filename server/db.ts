import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import ws from "ws";
import { neonConfig, Pool as NeonPool } from "@neondatabase/serverless";
import pg from "pg";

const { Pool: PgPool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const isLocal =
  DATABASE_URL.includes("127.0.0.1") || DATABASE_URL.includes("localhost");
const isNeon = DATABASE_URL.includes("neon.tech");

let pool: any;
if (isLocal || !isNeon) {
  pool = new PgPool({ connectionString: DATABASE_URL });
} else {
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: DATABASE_URL });
}

export const db = drizzle(pool, { schema });
