const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://games_greek_dictionary_user:8fpM7uQHOErYUz7tRdVPL3uzgtgBVMMD@dpg-d78tr5vfte5s739b8e3g-a.oregon-postgres.render.com/games_greek_dictionary",
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // leaderboard (Django GameScore model uses db_table = "leaderboard")
    await client.query(`CREATE TABLE IF NOT EXISTS leaderboard (
      id          BIGSERIAL PRIMARY KEY,
      user_id     BIGINT REFERENCES players(id) ON DELETE CASCADE,
      player_name VARCHAR(100) NOT NULL,
      game        VARCHAR(100) NOT NULL,
      score       INT          DEFAULT 0,
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    )`);

    // favorite_games (Django FavoriteGame uses db_table = "favorite_games")
    await client.query(`CREATE TABLE IF NOT EXISTS favorite_games (
      id         BIGSERIAL PRIMARY KEY,
      user_id    BIGINT REFERENCES players(id) ON DELETE CASCADE,
      game       VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW(),
      UNIQUE(user_id, game)
    )`);

    // favorite_words (Django FavoriteWord uses db_table = "favorite_words")
    await client.query(`CREATE TABLE IF NOT EXISTS favorite_words (
      id         BIGSERIAL PRIMARY KEY,
      user_id    BIGINT REFERENCES players(id) ON DELETE CASCADE,
      word       VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW(),
      UNIQUE(user_id, word)
    )`);

    // Drop wrongly-named tables from previous migration if they exist
    await client.query(`DROP TABLE IF EXISTS favorites_games`);
    await client.query(`DROP TABLE IF EXISTS favorites_words`);
    await client.query(`DROP TABLE IF EXISTS game_scores`);

    await client.query("COMMIT");
    console.log("Migration 2 complete - leaderboard + favorite tables created.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
