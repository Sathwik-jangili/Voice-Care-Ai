import sqlite3

conn = sqlite3.connect('voice_care.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()

print("=" * 60)
print("TABLES IN DATABASE:")
print("=" * 60)
if tables:
    for table in tables:
        print(f"  [OK] {table[0]}")
else:
    print("  No tables found!")

# Check for the specific tables we need
required_tables = ['guide_searches', 'navigator_queries', 'journal_entries']
print("\n" + "=" * 60)
print("CHECKING REQUIRED TABLES:")
print("=" * 60)
existing_table_names = [t[0] for t in tables]
for table in required_tables:
    if table in existing_table_names:
        print(f"  [OK] {table} - EXISTS")
    else:
        print(f"  [MISSING] {table} - NOT FOUND!")

conn.close()

