import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { __hiremailPool?: Pool };

export const db = globalForDb.__hiremailPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  max: 10,
});
if (process.env.NODE_ENV !== "production") globalForDb.__hiremailPool = db;

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return db.query<T>(text, params);
}
