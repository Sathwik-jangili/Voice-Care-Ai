"""
Create tables by importing the backend's database setup
This uses the same connection method as the backend
"""
import sys
from pathlib import Path

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from backend.database import engine, Base
    from backend import models
    
    print("=" * 60)
    print("CREATING TABLES USING BACKEND CONNECTION")
    print("=" * 60)
    print("\nThis will create all missing tables...")
    print("(Using the same database connection as the backend)\n")
    
    # Create all tables
    Base.metadata.create_all(bind=engine, checkfirst=True)
    
    print("[OK] Tables creation attempted")
    print("\nVerifying tables exist...")
    
    # Verify by checking if we can query the tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    required = ['guide_searches', 'navigator_queries', 'journal_entries']
    print("\n" + "=" * 60)
    for table in required:
        if table in existing_tables:
            print(f"  [OK] {table} - EXISTS")
        else:
            print(f"  [MISSING] {table} - NOT FOUND")
    print("=" * 60)
    
    if all(t in existing_tables for t in required):
        print("\nSUCCESS! All tables are now in the database.")
    else:
        print("\nSome tables are still missing.")
        print("You may need to restart your backend server.")
        
except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    print("\nThe backend server might need to be restarted for changes to take effect.")

