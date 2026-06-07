import sys
sys.path.insert(0, 'c:/Users/Sathwik Jangili/OneDrive/Documents/voice-care-ai-persona')

import sqlite3

print("=" * 60)
print("DATABASE MIGRATION - Adding New Tables")
print("=" * 60)

conn = sqlite3.connect('voice_care.db')
cursor = conn.cursor()

# Add new tables
print("\n[1/3] Creating guide_searches table...")
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS guide_searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            topic TEXT,
            explanation TEXT,
            next_steps TEXT,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    """)
    print("✓ guide_searches table created")
except Exception as e:
    print(f"Note: {e}")

print("\n[2/3] Creating navigator_queries table...")
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS navigator_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            query TEXT,
            what_to_expect TEXT,
            things_to_bring TEXT,
            questions_to_ask TEXT,
            notes TEXT,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    """)
    print("✓ navigator_queries table created")
except Exception as e:
    print(f"Note: {e}")

print("\n[3/3] Creating journal_entries table...")
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            title TEXT,
            content TEXT,
            mood TEXT,
            tags TEXT,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    """)
    print("✓ journal_entries table created")
except Exception as e:
    print(f"Note: {e}")

conn.commit()
conn.close()

print("\n" + "=" * 60)
print("✓ Migration complete! New tables added.")
print("=" * 60)
print("\nYou can now restart the backend.")
