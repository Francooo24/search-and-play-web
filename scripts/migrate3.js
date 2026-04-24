const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://games_greek_dictionary_user:8fpM7uQHOErYUz7tRdVPL3uzgtgBVMMD@dpg-d78tr5vfte5s739b8e3g-a.oregon-postgres.render.com/games_greek_dictionary",
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Drop old broken achievements table (wrong schema: had player_id + achievement_key)
    await client.query(`DROP TABLE IF EXISTS achievements CASCADE`);

    // Recreate achievements with the correct schema
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

    // Create user_achievements junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id             BIGSERIAL PRIMARY KEY,
        user_id        BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        earned_at      TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, achievement_id)
      )
    `);

    // Seed all achievements
    const seedPath = path.join(__dirname, "..", "achievements_seed.sql");
    const seed = fs.readFileSync(seedPath, "utf8");
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
