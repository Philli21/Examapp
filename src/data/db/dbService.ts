import { open, type DB, type Transaction } from '@op-engineering/op-sqlite';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const DB_NAME = 'examapp.db';
const TAG = '[DBService]';

const EMBEDDED_SCHEMA = `CREATE TABLE IF NOT EXISTS questions (
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
    ON questions (stream, subject);`;

let db: DB | null = null;
let initialized = false;

function log(message: string): void {
  console.log(`${TAG} ${message}`);
}

function logError(message: string, error: unknown): void {
  console.error(`${TAG} ${message}`, error);
}

function assertInitialized(): DB {
  if (!db || !initialized) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

async function readSchemaFile(): Promise<string> {
  try {
    if (Platform.OS === 'android') {
      return await RNFS.readFileAssets('schema.sql', 'utf8');
    }
    return await RNFS.readFile(`${RNFS.MainBundlePath}/schema.sql`, 'utf8');
  } catch {
    log('Schema file not found on disk, using embedded schema');
    return EMBEDDED_SCHEMA;
  }
}

async function executeSchema(dbInstance: DB): Promise<void> {
  const schema = await readSchemaFile();
  log(`Schema loaded (${schema.length} bytes), executing...`);
  await dbInstance.execute(schema);
  log('Schema executed successfully');
}

export async function initializeDatabase(): Promise<void> {
  try {
    if (initialized) {
      log('Already initialized, skipping');
      return;
    }

    log('Opening database...');
    db = open({ name: DB_NAME });
    log(`Database opened, path: ${db.getDbPath()}`);

    await executeSchema(db);

    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
    );
    const tables = (result.rows as Array<{ name: string }>).map((r) => r.name);
    log(`Tables created: ${tables.join(', ')}`);

    initialized = true;
    log('Initialization complete');
  } catch (error) {
    db = null;
    logError('Initialization failed', error);
    throw new Error(
      `Database initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function executeTransaction<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  const dbInstance = assertInitialized();

  try {
    let result: T;

    await dbInstance.transaction(async (tx) => {
      result = await fn(tx);
    });

    return result!;
  } catch (error) {
    logError('Transaction failed', error);
    throw new Error(
      `Transaction failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const dbInstance = assertInitialized();
    const result = await dbInstance.execute('SELECT 1 AS health_check');
    const rows = result.rows as Array<{ health_check: number }>;
    const healthy = rows.length > 0 && rows[0].health_check === 1;
    log(`Health check: ${healthy ? 'OK' : 'FAILED'}`);
    return healthy;
  } catch (error) {
    logError('Health check failed', error);
    return false;
  }
}

export function getDatabase(): DB {
  return assertInitialized();
}

export function isInitialized(): boolean {
  return initialized;
}
