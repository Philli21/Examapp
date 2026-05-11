CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 9 AND 12),
    stream TEXT NOT NULL CHECK (stream IN ('natural', 'social', 'shared')),
    subject TEXT NOT NULL,
    year INTEGER NOT NULL,
    chapter INTEGER NOT NULL CHECK (chapter BETWEEN 1 AND 16),
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_limit_sec INTEGER NOT NULL DEFAULT 90,
    question_text TEXT NOT NULL,
    question_images_json TEXT NOT NULL DEFAULT '[]',
    explanation_text TEXT,
    explanation_images_json TEXT NOT NULL DEFAULT '[]',
    source_type TEXT,
    source_name TEXT,
    competency TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]',
    package_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct INTEGER,
    mode TEXT NOT NULL,
    attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
    time_spent_seconds INTEGER
);

CREATE TABLE IF NOT EXISTS downloaded_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id TEXT NOT NULL UNIQUE,
    stream TEXT NOT NULL,
    subject TEXT NOT NULL,
    year INTEGER NOT NULL,
    download_date TEXT NOT NULL DEFAULT (datetime('now')),
    question_count INTEGER NOT NULL DEFAULT 0,
    size_bytes INTEGER
);

CREATE TABLE IF NOT EXISTS exam_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream TEXT,
    subject TEXT NOT NULL,
    year INTEGER,
    mode TEXT NOT NULL,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    score_percentage REAL
);

CREATE TABLE IF NOT EXISTS question_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    image_order INTEGER NOT NULL DEFAULT 0,
    width INTEGER,
    height INTEGER
);

CREATE INDEX IF NOT EXISTS idx_questions_filter
    ON questions (subject, year, chapter, package_id);

CREATE INDEX IF NOT EXISTS idx_questions_stream
    ON questions (stream, subject);
