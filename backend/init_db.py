"""
Database initialization script
Creates all tables defined in models.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import engine, Base
from backend.models import (
    Patient, Condition, Medication, Allergy, Observation,
    Interaction, SymptomsHistory, MedicalNote, AudioLog,
    GuideSearch, NavigatorQuery, JournalEntry
)

def init_database():
    """Create all database tables"""
    print("=" * 60)
    print("Initializing Database - Creating Tables")
    print("=" * 60)
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("\n✓ All tables created successfully!")
        print("\nTables created:")
        print("  - patients")
        print("  - conditions")
        print("  - medications")
        print("  - allergies")
        print("  - observations")
        print("  - interactions")
        print("  - symptoms_history")
        print("  - medical_notes")
        print("  - audio_logs")
        print("  - guide_searches")
        print("  - navigator_queries")
        print("  - journal_entries")
        print("\n" + "=" * 60)
        print("Database initialization complete!")
        print("=" * 60)
    except Exception as e:
        print(f"\nError creating tables: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    init_database()

