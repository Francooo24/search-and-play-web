const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://games_greek_dictionary_user:8fpM7uQHOErYUz7tRdVPL3uzgtgBVMMD@dpg-d78tr5vfte5s739b8e3g-a.oregon-postgres.render.com/games_greek_dictionary",
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`);

    await client.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id          BIGSERIAL PRIMARY KEY,
      player_name VARCHAR(100),
      activity    TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS password_resets (
      id         BIGSERIAL PRIMARY KEY,
      email      VARCHAR(255) NOT NULL,
      otp        VARCHAR(10)  NOT NULL,
      expires    TIMESTAMPTZ  NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS game_scores (
      id         BIGSERIAL PRIMARY KEY,
      player_id  BIGINT REFERENCES players(id) ON DELETE CASCADE,
      game       VARCHAR(100) NOT NULL,
      score      INT          DEFAULT 0,
      result     VARCHAR(20),
      created_at TIMESTAMPTZ  DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS achievements (
      id              BIGSERIAL PRIMARY KEY,
      player_id       BIGINT REFERENCES players(id) ON DELETE CASCADE,
      achievement_key VARCHAR(100) NOT NULL,
      unlocked_at     TIMESTAMPTZ  DEFAULT NOW(),
      UNIQUE(player_id, achievement_key)
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS notifications (
      id         BIGSERIAL PRIMARY KEY,
      player_id  BIGINT REFERENCES players(id) ON DELETE CASCADE,
      message    TEXT        NOT NULL,
      is_read    BOOLEAN     DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS daily_challenges (
      id             BIGSERIAL PRIMARY KEY,
      challenge_date DATE         UNIQUE NOT NULL,
      game           VARCHAR(100) NOT NULL,
      title          VARCHAR(255) NOT NULL,
      description    TEXT,
      target_type    VARCHAR(50)  DEFAULT 'win',
      target_value   INT          DEFAULT 1,
      bonus_points   INT          DEFAULT 50,
      created_at     TIMESTAMPTZ  DEFAULT NOW()
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS daily_challenge_completions (
      id           BIGSERIAL PRIMARY KEY,
      player_id    BIGINT REFERENCES players(id)          ON DELETE CASCADE,
      challenge_id BIGINT REFERENCES daily_challenges(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(player_id, challenge_id)
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS game_settings (
      id      BIGSERIAL PRIMARY KEY,
      slug    VARCHAR(100) UNIQUE NOT NULL,
      enabled BOOLEAN DEFAULT TRUE
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS favorites_words (
      id         BIGSERIAL PRIMARY KEY,
      player_id  BIGINT REFERENCES players(id) ON DELETE CASCADE,
      word       VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW(),
      UNIQUE(player_id, word)
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS favorites_games (
      id         BIGSERIAL PRIMARY KEY,
      player_id  BIGINT REFERENCES players(id) ON DELETE CASCADE,
      game_slug  VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW(),
      UNIQUE(player_id, game_slug)
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS search_history (
      id         BIGSERIAL PRIMARY KEY,
      player_id  BIGINT REFERENCES players(id) ON DELETE CASCADE,
      word       VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    )`);

    await client.query("COMMIT");
    console.log("Migration complete - all tables created.");
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
