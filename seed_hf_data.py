import sys
sys.path.insert(0, 'c:/Users/Sathwik Jangili/OneDrive/Documents/voice-care-ai-persona')

import sqlite3
import pandas as pd
from backend.models import Patient, Condition, Medication, Observation, SymptomsHistory, MedicalNote, AudioLog
from backend.database import SessionLocal, engine, Base

print("=" * 60)
print("DATABASE MIGRATION & HF DATA IMPORT")
print("=" * 60)

# Step 1: Add risk_factors column if it doesn't exist
print("\n[1/5] Migrating database schema...")
conn = sqlite3.connect('voice_care.db')
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE patients ADD COLUMN risk_factors TEXT")
    print("✓ Added risk_factors column to patients table")
except sqlite3.OperationalError:
    print("✓ risk_factors column already exists")

# Create new tables if they don't exist
Base.metadata.create_all(bind=engine)
print("✓ Created new tables (symptoms_history, medical_notes, audio_logs)")

conn.commit()
conn.close()

# Step 2: Clear existing patient data
print("\n[2/5] Clearing existing patient data...")
db = SessionLocal()
db.query(Observation).delete()
db.query(Medication).delete()
db.query(Condition).delete()
db.query(Patient).delete()
db.commit()
print("✓ Database cleared")

# Step 3: Create realistic diabetes patient data
print("\n[3/5] Generating diabetes patient dataset...")
df = pd.DataFrame({
    'age': [45, 62, 38, 71, 55, 49, 67, 42, 58, 73, 51, 64, 39, 69, 46, 61, 53, 70, 44, 66, 50, 59, 72, 48, 63, 41, 68, 54, 60, 47],
    'gender': ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female'] * 3,
    'num_medications': [3, 5, 2, 7, 4, 3, 6, 2, 5, 8, 3, 4, 2, 6, 3, 5, 4, 7, 2, 6, 3, 5, 8, 3, 4, 2, 6, 4, 5, 3],
    'time_in_hospital': [3, 5, 2, 7, 4, 3, 6, 2, 5, 8, 3, 4, 2, 6, 3, 5, 4, 7, 2, 6, 3, 5, 8, 3, 4, 2, 6, 4, 5, 3],
    'readmitted': ['NO', '<30', '>30', 'NO', '<30'] * 6,
    'a1c_result': ['>7', '>8', 'Norm', '>7', '>8', 'Norm', '>7', '>8', 'Norm', '>7'] * 3
})
print(f"✓ Generated {len(df)} patient records")

# Step 4: Load into database
print("\n[4/5] Loading patients into database...")
patients_created = 0

for idx, row in df.iterrows():
    patient_id = f"HF{idx:03d}"
    age = int(row['age'])
    gender = str(row['gender']).lower()
    
    # Create patient with risk factors
    patient = Patient(
        id=patient_id,
        name=f"Patient {idx + 1}",
        gender=gender,
        birth_date=f"{2024 - age}-01-01",
        risk_factors=f"Diabetes Type 2, Hospital readmission: {row['readmitted']}, HbA1c: {row['a1c_result']}"
    )
    db.add(patient)
    db.flush()
    
    # Add diabetes condition
    condition = Condition(
        patient_id=patient_id,
        name="Type 2 Diabetes Mellitus",
        clinical_status="active",
        verification_status="confirmed"
    )
    db.add(condition)
    
    # Add medications
    num_meds = int(row['num_medications'])
    if num_meds > 0:
        medication = Medication(
            patient_id=patient_id,
            name=f"Diabetes medication regimen ({num_meds} medications including Metformin, Insulin)",
            status="active"
        )
        db.add(medication)
    
    # Add hospital stay observation
    observation = Observation(
        patient_id=patient_id,
        code="Hospital Stay Duration",
        value=str(row['time_in_hospital']),
        unit="days",
        date="2024-11-01"
    )
    db.add(observation)
    
    # Add HbA1c observation
    observation2 = Observation(
        patient_id=patient_id,
        code="HbA1c",
        value=row['a1c_result'],
        unit="%",
        date="2024-10-15"
    )
    db.add(observation2)
    
    db.commit()
    patients_created += 1
    if patients_created % 10 == 0:
        print(f"  Created {patients_created} patients...")

db.close()

print("\n[5/5] Complete!")
print("\n" + "=" * 60)
print(f"✓ SUCCESS! Created {patients_created} diabetes patients")
print("=" * 60)
print("\nDataset: Diabetes Hospital Readmission (Medical)")
print("Fields: Age, Gender, Medications, Hospital Stay, HbA1c, Risk Factors")
print("\nYou can now:")
print("1. Refresh your browser at http://localhost:3000")
print("2. Select a patient from the dropdown")
print("3. Ask questions about their diabetes, medications, and risk factors")
