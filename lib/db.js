import { Pool,types } from "pg";
// pg parses DATE (OID 1082) into a JS Date at local midnight, which
// JSON.stringify then renders as UTC: "2026-08-22" comes back as
// "2026-08-22T04:00:00.000Z" and shows as the 21st for anyone west of us.
// A calendar date has no time and no timezone - keep it a plain string.
types.setTypeParser(1082, (value) => value)

// pg returns NUMERIC (OID 1700) as a string because numeric can hold values
// outside JS's safe integer range, and silently losing precision is worse
// than making you decide. Our numerics are weights and macros - well inside
// the safe range - so parse them. Do NOT do this for money.
types.setTypeParser(1700, (value) => parseFloat(value))

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
