"""
Force create tables - will wait for database to be available
"""
import sqlite3
import time
import sys
from pathlib import Path

db_path = Path(__file__).parent / 'voice_care.db'

print("=" * 60)
print("CREATING MISSING TABLES")
print("=" * 60)
print(f"\nDatabase: {db_path}")
print("Attempting to create tables...\n")

# Try multiple times with retries
max_retries = 5
retry_delay = 2

for attempt in range(max_retries):
    try:
        conn = sqlite3.connect(str(db_path), timeout=10.0)
        cursor = conn.cursor()
        
        # Create guide_searches
        print(f"[Attempt {attempt + 1}] Creating guide_searches...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS guide_searches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id VARCHAR,
                topic VARCHAR,
                explanation TEXT,
                next_steps TEXT,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("  [OK] guide_searches created")
        
        # Create navigator_queries
        print(f"[Attempt {attempt + 1}] Creating navigator_queries...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS navigator_queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id VARCHAR,
                query TEXT,
                what_to_expect TEXT,
                things_to_bring TEXT,
                questions_to_ask TEXT,
                notes TEXT,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("  [OK] navigator_queries created")
        
        # Create journal_entries
        print(f"[Attempt {attempt + 1}] Creating journal_entries...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id VARCHAR,
                title VARCHAR,
                content TEXT,
                mood VARCHAR,
                tags TEXT,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("  [OK] journal_entries created")
        
        conn.commit()
        conn.close()
        
        print("\n" + "=" * 60)
        print("SUCCESS! All tables created.")
        print("=" * 60)
        
        # Verify
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('guide_searches', 'navigator_queries', 'journal_entries')")
        tables = cursor.fetchall()
        print("\nVerified tables:")
        for table in tables:
            print(f"  [OK] {table[0]}")
        conn.close()
        
        sys.exit(0)
        
    except sqlite3.OperationalError as e:
        if "locked" in str(e).lower():
            if attempt < max_retries - 1:
                print(f"  Database locked, waiting {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"\n[ERROR] Database is still locked after {max_retries} attempts.")
                print("\nPlease stop your backend server and run:")
                print("  python create_tables_now.py")
                sys.exit(1)
        else:
            print(f"  [ERROR] {e}")
            sys.exit(1)
    except Exception as e:
        print(f"  [ERROR] {e}")
        sys.exit(1)

