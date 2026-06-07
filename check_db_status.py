import sqlite3

conn = sqlite3.connect('voice_care.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("=" * 60)
print("DATABASE TABLES")
print("=" * 60)
for table in tables:
    print(f"- {table[0]}")
    
print("\n" + "=" * 60)
print("PATIENT COUNT")
print("=" * 60)
try:
    cursor.execute("SELECT COUNT(*) FROM patients")
    count = cursor.fetchone()[0]
    print(f"Total patients: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, name FROM patients LIMIT 5")
        patients = cursor.fetchall()
        print("\nFirst 5 patients:")
        for p in patients:
            print(f"  - {p[1]} (ID: {p[0]})")
except Exception as e:
    print(f"Error: {e}")

conn.close()
