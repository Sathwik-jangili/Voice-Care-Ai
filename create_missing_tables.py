import sqlite3
import sys

print("=" * 60)
print("CREATING MISSING TABLES")
print("=" * 60)

conn = sqlite3.connect('voice_care.db')
cursor = conn.cursor()

# Create guide_searches table
print("\n[1/3] Creating guide_searches table...")
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS guide_searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id VARCHAR,
            topic VARCHAR,
            explanation TEXT,
            next_steps TEXT,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        )
    """)
    print("  [OK] guide_searches table created")
except Exception as e:
    print(f"  [ERROR] {e}")

# Create navigator_queries table
print("\n[2/3] Creating navigator_queries table...")
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS navigator_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id VARCHAR,
            query TEXT,
            what_to_expect TEXT,
            things_to_bring TEXT,
            questions_to_ask TEXT,
            notes TEXT,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        )
    """)
    print("  [OK] navigator_queries table created")
except Exception as e:
    print(f"  [ERROR] {e}")

# Create journal_entries table
print("\n[3/3] Creating journal_entries table...")
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id VARCHAR,
            title VARCHAR,
            content TEXT,
            mood VARCHAR,
            tags TEXT,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        )
    """)
    print("  [OK] journal_entries table created")
except Exception as e:
    print(f"  [ERROR] {e}")

conn.commit()

# Verify tables were created
print("\n" + "=" * 60)
print("VERIFYING TABLES:")
print("=" * 60)
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('guide_searches', 'navigator_queries', 'journal_entries') ORDER BY name")
created_tables = cursor.fetchall()
for table in created_tables:
    print(f"  [OK] {table[0]}")

conn.close()

print("\n" + "=" * 60)
print("DONE! Tables created successfully.")
print("=" * 60)

