-- PostgreSQL — run once to create achievements tables
-- Then run achievements_seed.sql to populate data

CREATE TABLE IF NOT EXISTS achievements (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100)  NOT NULL,
  description      TEXT          NOT NULL,
  icon             VARCHAR(10)   NOT NULL,
  condition_type   VARCHAR(50)   NOT NULL,
  condition_value  INT           NOT NULL,
  game_specific    VARCHAR(100)  NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             SERIAL PRIMARY KEY,
  user_id        INT  NOT NULL,
  achievement_id INT  NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);
