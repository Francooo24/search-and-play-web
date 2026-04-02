-- Run this against games_dictionary if the tables don't exist yet

CREATE TABLE IF NOT EXISTS daily_challenges (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  challenge_date DATE         NOT NULL UNIQUE,
  game           VARCHAR(100) NOT NULL,
  title          VARCHAR(200) NOT NULL,
  description    TEXT         NOT NULL,
  target_type    VARCHAR(50)  NOT NULL DEFAULT 'win',
  target_value   INT          NOT NULL DEFAULT 1,
  bonus_points   INT          NOT NULL DEFAULT 50,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  challenge_id INT UNSIGNED NOT NULL,
  completed_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_completion (user_id, challenge_id),
  FOREIGN KEY (user_id)      REFERENCES players(id)           ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample challenge for today (run once to test)
INSERT IGNORE INTO daily_challenges (challenge_date, game, title, description, target_type, target_value, bonus_points)
VALUES (CURDATE(), 'Wordle', 'Wordle Warm-Up', 'Play Wordle once today to earn bonus points!', 'win', 1, 50);
