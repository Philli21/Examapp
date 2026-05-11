import { open, type DB, type Transaction } from '@op-engineering/op-sqlite';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const DB_NAME = 'examapp.db';

let db: DB | null = null;
let initialized = false;

function assertInitialized(): DB {
  if (!db || !initialized) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

async function readSchemaFile(): Promise<string> {
  if (Platform.OS === 'android') {
    return await RNFS.readFileAssets('schema.sql', 'utf8');
  }
  return await RNFS.readFile(`${RNFS.MainBundlePath}/schema.sql`, 'utf8');
}

async function ensureAssetsCopied(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  const destPath = `${RNFS.DocumentDirectoryPath}/schema.sql`;
  const exists = await RNFS.exists(destPath);
  if (!exists) {
    const content = await readSchemaFile();
    await RNFS.writeFile(destPath, content, 'utf8');
  }
}

async function executeSchema(dbInstance: DB): Promise<void> {
  const schema = await readSchemaFile();
  await dbInstance.execute(schema);
}

export async function initializeDatabase(): Promise<void> {
  try {
    if (initialized) {
      return;
    }

    db = open({ name: DB_NAME });
    await ensureAssetsCopied();
    await executeSchema(db);
    initialized = true;
  } catch (error) {
    db = null;
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
    return rows.length > 0 && rows[0].health_check === 1;
  } catch {
    return false;
  }
}

export function getDatabase(): DB {
  return assertInitialized();
}

export function isInitialized(): boolean {
  return initialized;
}
