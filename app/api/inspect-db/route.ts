import { NextResponse } from 'next/server';
import { getDbConnection } from '@/scripts/db';

export async function GET() {
  const db = getDbConnection();
  let output = [];

  try {
    output.push('--- Inspecting Database Schema ---');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    output.push(`Tables found: ${tables.map(t => t.name).join(', ')}`);

    for (const table of tables) {
      output.push(`\n--- Schema for table: ${table.name} ---`);
      const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
      output.push(JSON.stringify(schema, null, 2));

      output.push(`\n--- Sample data from ${table.name} (first 3 rows) ---`);
      try {
        const sampleData = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
        output.push(JSON.stringify(sampleData, null, 2));
      } catch (err: any) {
        output.push(`Could not fetch sample data for ${table.name}: ${err.message}`);
      }
    }

    return new NextResponse(output.join('\n'), {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (err: any) {
    console.error('An error occurred during inspection:', err.message);
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
