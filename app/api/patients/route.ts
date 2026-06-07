import { NextResponse } from 'next/server';
import { getDbConnection } from '@/scripts/db';

export async function GET() {
  try {
    const db = getDbConnection();
    console.log('Fetching patients from database...');
    
    // Fetch patients from database
    const patients = db.prepare('SELECT id, name, gender, birth_date, risk_factors FROM patients').all();
    console.log(`Found ${patients.length} patients`);
    
    return NextResponse.json(patients);
  } catch (error: any) {
    console.error('Failed to fetch patients:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ error: 'Failed to fetch patients', details: error.message }, { status: 500 });
  }
}
