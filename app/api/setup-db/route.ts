import { NextResponse } from 'next/server';
import { getDbConnection } from '@/scripts/db';

export async function POST() {
  const db = getDbConnection();
  let output = [];

  try {
    output.push('--- Setting up database tables ---');

    // Create guide_searches table
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS guide_searches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT NOT NULL,
          response TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      output.push('Table "guide_searches" created or already exists.');
    } catch (err: any) {
      output.push(`Error creating guide_searches: ${err.message}`);
    }

    // Create navigator_searches table
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS navigator_searches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT NOT NULL,
          response TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      output.push('Table "navigator_searches" created or already exists.');
    } catch (err: any) {
      output.push(`Error creating navigator_searches: ${err.message}`);
    }

    return new NextResponse(output.join('\n'), {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (err: any) {
    console.error('An error occurred during setup:', err.message);
    return new NextResponse(`An error occurred: ${err.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  } finally {
    if (db && db.open) {
      db.close();
    }
  }
}
