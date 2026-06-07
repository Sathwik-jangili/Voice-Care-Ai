import Database from 'better-sqlite3';
import type { Database as DB } from 'better-sqlite3';

// This helps avoid issues with hot-reloading in development
declare global {
  var db: DB | undefined;
}

export function getDbConnection(): DB {
  if (!global.db) {
    const dbInstance = new Database('voice_care.db');
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('busy_timeout = 5000');
    global.db = dbInstance;
  }
  return global.db;
}
