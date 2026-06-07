import sys
sys.path.insert(0, 'c:/Users/Sathwik Jangili/OneDrive/Documents/voice-care-ai-persona')

from backend.database import SessionLocal
from backend.models import Patient

db = SessionLocal()
patients = db.query(Patient).all()
print(f"Total patients in database: {len(patients)}")
for p in patients[:5]:
    print(f"  - {p.name} (ID: {p.id})")
db.close()
