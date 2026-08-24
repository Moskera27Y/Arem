// Neon Postgres helper — server-only. Reads DATABASE_URL from env.
// Run scripts with: node --env-file=.env.local <script>.mjs
import pg from "pg";

const { Client } = pg;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new Client({ connectionString, ssl: { rejectUnauthorized: false } });
}

export async function query(text, params = []) {
  const client = getDb();
  await client.connect();
  try {
    return await client.query(text, params);
  } finally {
    await client.end();
  }
}
