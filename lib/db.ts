import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'voice_care.db');
const db = new Database(dbPath);

// Initialize database with tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    condition TEXT,
    medical_history TEXT,
    medications TEXT
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    transcript TEXT,
    ai_response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );
`);

export default db;
