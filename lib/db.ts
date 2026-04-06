import { Pool } from "pg";

let _pool: Pool | null = null;

function getPool(): Pool {
  if (_pool) return _pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  _pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 8,
    idleTimeoutMillis: 60000,
  });

  return _pool;
}

export default {
  query: (text: string, params?: any[]) => getPool().query(text, params),
};
