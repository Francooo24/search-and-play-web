-- Run this to replace old achievements with the full reward system
USE games_dictionary;

-- Clear old data
DELETE FROM user_achievements;
DELETE FROM achievements;
ALTER TABLE achievements AUTO_INCREMENT = 1;

-- ── Milestone: Games Played ──────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('First Steps',       'Play your first game',    '🎮', 'games_played', 1,   NULL),
('Getting Started',   'Play 10 games',            '🚀', 'games_played', 10,  NULL),
('Regular Player',    'Play 25 games',            '🎯', 'games_played', 25,  NULL),
('Dedicated Player',  'Play 50 games',            '⭐', 'games_played', 50,  NULL),
('Game Enthusiast',   'Play 100 games',           '🔥', 'games_played', 100, NULL),
('Game Master',       'Play 200 games',           '👑', 'games_played', 200, NULL),
('Legend',            'Play 500 games',           '🏅', 'games_played', 500, NULL);

-- ── Milestone: Total Points ──────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('Point Starter',     'Earn 100 total points',    '💡', 'total_points', 100,   NULL),
('Point Collector',   'Earn 500 total points',    '💰', 'total_points', 500,   NULL),
('Point Hoarder',     'Earn 1,000 total points',  '💎', 'total_points', 1000,  NULL),
('Point Machine',     'Earn 5,000 total points',  '⚡', 'total_points', 5000,  NULL),
('Point Master',      'Earn 10,000 total points', '🌟', 'total_points', 10000, NULL),
('Point Legend',      'Earn 50,000 total points', '🏆', 'total_points', 50000, NULL);

-- ── Milestone: Single-Game High Score ────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('Sharp Mind',        'Score 50+ in a single game',   '🧠', 'score', 50,  NULL),
('High Scorer',       'Score 100+ in a single game',  '🎖️', 'score', 100, NULL),
('Score Hunter',      'Score 150+ in a single game',  '🏹', 'score', 150, NULL),
('Elite Scorer',      'Score 200+ in a single game',  '💥', 'score', 200, NULL);

-- ── Daily Challenge ───────────────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('Daily Starter',     'Complete your first daily challenge',  '📅', 'games_played', 1,  'Daily Challenge'),
('Daily Streak 3',    'Complete 3 daily challenges',          '🔥', 'games_played', 3,  'Daily Challenge'),
('Daily Streak 7',    'Complete 7 daily challenges',          '📆', 'games_played', 7,  'Daily Challenge'),
('Daily Streak 30',   'Complete 30 daily challenges',         '🗓️', 'games_played', 30, 'Daily Challenge');

-- ── Word Search ───────────────────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('First Search',      'Search your first word',               '🔍', 'searches', 1,   NULL),
('Word Explorer',     'Search 10 words',                      '📖', 'searches', 10,  NULL),
('Word Hunter',       'Search 50 words',                      '🗺️', 'searches', 50,  NULL),
('Dictionary Pro',    'Search 100 words',                     '📚', 'searches', 100, NULL);

-- ── Favorites ─────────────────────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('First Favorite',    'Save your first word',                 '⭐', 'favorites', 1,  NULL),
('Word Collector',    'Save 10 favorite words',               '📌', 'favorites', 10, NULL),
('Word Hoarder',      'Save 25 favorite words',               '🗂️', 'favorites', 25, NULL);

-- ── Kids Games ───────────────────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('Animal Whisperer',  'Score 100+ in Animal Match',   '🐾', 'score', 100, 'Animal Match'),
('Color Expert',      'Score 100+ in Color Words',    '🎨', 'score', 100, 'Color Words'),
('Math Whiz',         'Score 100+ in Simple Math',    '➕', 'score', 100, 'Simple Math'),
('Counting Pro',      'Score 100+ in Count & Click',  '🔢', 'score', 100, 'Count & Click'),
('Rhyme Master',      'Score 100+ in Rhyme Time',     '🎵', 'score', 100, 'Rhyme Time'),
('Shape Shifter',     'Score 100+ in Shape Match',    '🔷', 'score', 100, 'Shape Match'),
('Balloon Buster',    'Score 50+ in Balloon Pop',     '🎈', 'score', 50,  'Balloon Pop'),
('Odd Spotter',       'Score 100+ in Odd One Out',    '🎪', 'score', 100, 'Odd One Out'),
('Memory Champion',   'Score 100+ in Memory Game',   '🧠', 'score', 100, 'Memory Game'),
('Tic-Tac-Toe Pro',   'Win 3 games in Tic Tac Toe',  '⭕', 'games_played', 3, 'Tic Tac Toe');

-- ── Teen Games ───────────────────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('Hangman Hero',      'Score 100+ in Hangman',        '🪢', 'score', 100, 'Hangman'),
('Word Guesser',      'Score 50+ in WordGuess',       '📝', 'score', 50,  'WordGuess'),
('Word Finder',       'Score 100+ in Word Search',    '🔍', 'score', 100, 'Word Search'),
('Spelling Champ',    'Score 100+ in Spelling Bee',   '🐝', 'score', 100, 'Spelling Bee'),
('Synonym Sage',      'Score 100+ in Synonym Match',  '🔄', 'score', 100, 'Synonym Match'),
('Scramble King',     'Score 100+ in Word Scramble',  '🔀', 'score', 100, 'Word Scramble'),
('Trivia Ace',        'Score 100+ in Trivia Blitz',   '🧠', 'score', 100, 'Trivia Blitz'),
('Flag Expert',       'Score 100+ in Flag Quiz',      '🗺️', 'score', 100, 'Flag Quiz'),
('Math Racer',        'Score 100+ in Math Race',      '🧮', 'score', 100, 'Math Race'),
('Grammar Guru',      'Score 100+ in Sentence Fix',   '✍️', 'score', 100, 'Sentence Fix');

-- ── Adult Games ──────────────────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, condition_type, condition_value, game_specific) VALUES
('Crossword Expert',  'Score 100+ in Crossword',      '📋', 'score', 100, 'Crossword'),
('Code Breaker',      'Score 100+ in Cryptogram',     '🔐', 'score', 100, 'Cryptogram'),
('Word Blitzer',      'Score 100+ in Word Blitz',     '⚡', 'score', 100, 'Word Blitz'),
('Anagram Ace',       'Score 100+ in Anagram Master', '🔀', 'score', 100, 'Anagram Master'),
('Duel Champion',     'Score 100+ in Word Duel',      '⚔️', 'score', 100, 'Word Duel'),
('Trivia Master',     'Score 100+ in Speed Trivia',   '🧠', 'score', 100, 'Speed Trivia'),
('Vocab Virtuoso',    'Score 100+ in Vocabulary Quiz','📚', 'score', 100, 'Vocabulary Quiz'),
('Idiom Insider',     'Score 100+ in Idiom Challenge','💬', 'score', 100, 'Idiom Challenge'),
('Logic Lord',        'Score 100+ in Logic Grid',     '🔍', 'score', 100, 'Logic Grid'),
('Deduction King',    'Score 100+ in Deduction',      '🧩', 'score', 100, 'Deduction');
