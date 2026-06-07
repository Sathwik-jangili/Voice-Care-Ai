import { getDbConnection } from './db';

function inspectDatabase() {
  const db = getDbConnection();
  try {
    console.log('--- Inspecting Database Schema ---');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    console.log('Tables found:', tables.map(t => t.name));

    tables.forEach(table => {
      console.log(`\n--- Schema for table: ${table.name} ---`);
      const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
      console.table(schema);

      console.log(`\n--- Sample data from ${table.name} (first 3 rows) ---`);
      try {
        const sampleData = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
        console.table(sampleData);
      } catch (err: any) {
        console.log(`Could not fetch sample data for ${table.name}: ${err.message}`);
      }
    });

  } catch (err: any) {
    console.error('An error occurred during inspection:', err.message);
  } finally {
    if (db && db.open) {
      db.close();
      console.log('\nDatabase connection closed.');
    }
  }
}

inspectDatabase();
