"""
Create missing tables using SQLAlchemy
Run this when the backend is NOT running
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from backend.database import engine, Base
from backend.models import (
    GuideSearch, NavigatorQuery, JournalEntry
)

print("=" * 60)
print("CREATING MISSING TABLES USING SQLALCHEMY")
print("=" * 60)

try:
    # Create only the missing tables
    print("\nCreating guide_searches table...")
    GuideSearch.__table__.create(bind=engine, checkfirst=True)
    print("  [OK] guide_searches created")
    
    print("\nCreating navigator_queries table...")
    NavigatorQuery.__table__.create(bind=engine, checkfirst=True)
    print("  [OK] navigator_queries created")
    
    print("\nCreating journal_entries table...")
    JournalEntry.__table__.create(bind=engine, checkfirst=True)
    print("  [OK] journal_entries created")
    
    print("\n" + "=" * 60)
    print("SUCCESS! All tables created.")
    print("=" * 60)
    print("\nYou can now restart your backend server.")
    
except Exception as e:
    print(f"\n[ERROR] {e}")
    print("\nMake sure the backend server is NOT running!")
    print("Then run this script again.")

