const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'voice-care.db');
const db = new Database(dbPath);

console.log('Initializing database...');

// Create tables
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

// Check if we have patients, if not add a mock one
const stmt = db.prepare('SELECT count(*) as count FROM patients');
const result = stmt.get();

if (result.count === 0) {
    console.log('Seeding mock patient data...');
    const insert = db.prepare(`
    INSERT INTO patients (name, age, condition, medical_history, medications)
    VALUES (?, ?, ?, ?, ?)
  `);

    insert.run(
        'John Doe',
        65,
        'Hypertension, Type 2 Diabetes',
        'Diagnosed with hypertension in 2015. Type 2 Diabetes diagnosed in 2018. History of mild asthma.',
        'Lisinopril 10mg daily, Metformin 500mg twice daily'
    );
    console.log('Mock patient John Doe added.');
} else {
    console.log('Database already seeded.');
}

console.log('Database initialization complete.');
