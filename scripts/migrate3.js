const fs   = require("fs");
const path = require("path");

// Load .env.local manually (no dotenv dependency needed)
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !process.env[key.trim()])
      process.env[key.trim()] = rest.join("=").trim();
  });
}

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`DROP TABLE IF EXISTS user_achievements`);
    await client.query(`DROP TABLE IF EXISTS achievements`);

    await client.query(`
      CREATE TABLE achievements (
        id              BIGSERIAL PRIMARY KEY,
        name            VARCHAR(100) NOT NULL,
        description     TEXT         NOT NULL,
        icon            VARCHAR(10)  NOT NULL,
        condition_type  VARCHAR(50)  NOT NULL,
        condition_value INT          NOT NULL,
        game_specific   VARCHAR(100) NULL
      )
    `);

    await client.query(`
      CREATE TABLE user_achievements (
        id             BIGSERIAL PRIMARY KEY,
        user_id        BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        earned_at      TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, achievement_id)
      )
    `);

    const seed = fs.readFileSync(path.join(__dirname, "..", "achievements_seed.sql"), "utf8");
    await client.query(seed);

    await client.query("COMMIT");
    console.log("Migration 3 complete — achievements + user_achievements created and seeded.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration 3 failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
