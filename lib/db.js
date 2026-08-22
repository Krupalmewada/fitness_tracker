import { Pool } from "pg";

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
};

let pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool(poolConfig);
} else {
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = new Pool(poolConfig);
  }

  pool = globalThis.__pgPool;
}

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

export async function transaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        "Transaction failed and rollback failed",
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

export default pool;
