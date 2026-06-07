import sys
sys.path.insert(0, 'c:/Users/Sathwik Jangili/OneDrive/Documents/voice-care-ai-persona')

import sqlite3
from backend.models import Patient, Condition, Medication, Observation, Allergy
from backend.database import SessionLocal, engine, Base
from datetime import datetime, timedelta
import random

print("=" * 60)
print("DIVERSE MEDICAL DATASET IMPORT")
print("=" * 60)

# Ensure schema is up to date
Base.metadata.create_all(bind=engine)

# Clear existing data
print("\n[1/3] Clearing existing data...")
db = SessionLocal()
db.query(Observation).delete()
db.query(Allergy).delete()
db.query(Medication).delete()
db.query(Condition).delete()
db.query(Patient).delete()
db.commit()
print("✓ Database cleared")

# Diverse patient data
print("\n[2/3] Creating diverse patient profiles...")

patients_data = [
    {"name": "James Anderson", "age": 45, "gender": "male", "conditions": ["Hypertension", "High Cholesterol"], 
     "meds": ["Lisinopril 10mg daily", "Atorvastatin 20mg daily"], "allergies": ["Penicillin"],
     "obs": [("Blood Pressure", "142/88", "mmHg"), ("Total Cholesterol", "215", "mg/dL")]},
    
    {"name": "Maria Garcia", "age": 62, "gender": "female", "conditions": ["Type 2 Diabetes", "Osteoarthritis"], 
     "meds": ["Metformin 500mg twice daily", "Ibuprofen 400mg as needed"], "allergies": ["Sulfa drugs"],
     "obs": [("Blood Glucose", "156", "mg/dL"), ("HbA1c", "7.8", "%")]},
    
    {"name": "David Chen", "age": 38, "gender": "male", "conditions": ["Asthma", "Seasonal Allergies"], 
     "meds": ["Albuterol inhaler as needed", "Fluticasone 110mcg twice daily", "Cetirizine 10mg daily"], "allergies": ["Pollen", "Dust mites"],
     "obs": [("Peak Flow", "420", "L/min"), ("Oxygen Saturation", "97", "%")]},
    
    {"name": "Sarah Johnson", "age": 71, "gender": "female", "conditions": ["Atrial Fibrillation", "Hypothyroidism"], 
     "meds": ["Warfarin 5mg daily", "Levothyroxine 75mcg daily"], "allergies": [],
     "obs": [("INR", "2.3", "ratio"), ("TSH", "3.2", "mIU/L")]},
    
    {"name": "Michael Brown", "age": 55, "gender": "male", "conditions": ["GERD", "Anxiety Disorder"], 
     "meds": ["Omeprazole 20mg daily", "Sertraline 50mg daily"], "allergies": ["Aspirin"],
     "obs": [("Weight", "89", "kg"), ("Heart Rate", "76", "bpm")]},
    
    {"name": "Emily Rodriguez", "age": 49, "gender": "female", "conditions": ["Migraine", "Iron Deficiency Anemia"], 
     "meds": ["Sumatriptan 50mg as needed", "Ferrous Sulfate 325mg daily"], "allergies": [],
     "obs": [("Hemoglobin", "11.2", "g/dL"), ("Ferritin", "15", "ng/mL")]},
    
    {"name": "Robert Williams", "age": 67, "gender": "male", "conditions": ["COPD", "Coronary Artery Disease"], 
     "meds": ["Tiotropium inhaler daily", "Aspirin 81mg daily", "Metoprolol 50mg twice daily"], "allergies": ["Codeine"],
     "obs": [("FEV1", "62", "%predicted"), ("Ejection Fraction", "55", "%")]},
    
    {"name": "Jennifer Lee", "age": 42, "gender": "female", "conditions": ["Rheumatoid Arthritis", "Depression"], 
     "meds": ["Methotrexate 15mg weekly", "Folic Acid 1mg daily", "Escitalopram 10mg daily"], "allergies": ["Latex"],
     "obs": [("CRP", "12", "mg/L"), ("RF", "45", "IU/mL")]},
    
    {"name": "Thomas Martinez", "age": 58, "gender": "male", "conditions": ["Chronic Kidney Disease Stage 3", "Gout"], 
     "meds": ["Allopurinol 300mg daily", "Sodium Bicarbonate 650mg twice daily"], "allergies": [],
     "obs": [("eGFR", "48", "mL/min"), ("Creatinine", "1.8", "mg/dL")]},
    
    {"name": "Lisa Taylor", "age": 73, "gender": "female", "conditions": ["Osteoporosis", "Macular Degeneration"], 
     "meds": ["Alendronate 70mg weekly", "Vitamin D 2000IU daily", "AREDS2 vitamins daily"], "allergies": [],
     "obs": [("Bone Density T-score", "-2.8", "SD"), ("Visual Acuity", "20/40", "")]},
    
    {"name": "Christopher Davis", "age": 51, "gender": "male", "conditions": ["Sleep Apnea", "Obesity"], 
     "meds": ["CPAP therapy nightly"], "allergies": [],
     "obs": [("BMI", "34.2", "kg/m²"), ("AHI", "28", "events/hour")]},
    
    {"name": "Amanda Wilson", "age": 64, "gender": "female", "conditions": ["Parkinson's Disease", "Constipation"], 
     "meds": ["Carbidopa-Levodopa 25-100mg three times daily", "Polyethylene Glycol daily"], "allergies": [],
     "obs": [("UPDRS Score", "32", "points"), ("Tremor Severity", "Moderate", "")]},
    
    {"name": "Daniel Moore", "age": 39, "gender": "male", "conditions": ["Crohn's Disease", "Vitamin B12 Deficiency"], 
     "meds": ["Adalimumab 40mg every 2 weeks", "Cyanocobalamin 1000mcg monthly"], "allergies": ["Shellfish"],
     "obs": [("CRP", "8", "mg/L"), ("B12", "280", "pg/mL")]},
    
    {"name": "Patricia Anderson", "age": "69", "gender": "female", "conditions": ["Heart Failure", "Diabetes Type 2"], 
     "meds": ["Furosemide 40mg daily", "Carvedilol 12.5mg twice daily", "Insulin Glargine 20 units nightly"], "allergies": [],
     "obs": [("BNP", "450", "pg/mL"), ("HbA1c", "7.1", "%")]},
    
    {"name": "Kevin Thomas", "age": 46, "gender": "male", "conditions": ["Psoriasis", "Psoriatic Arthritis"], 
     "meds": ["Ustekinumab 45mg every 12 weeks", "Naproxen 500mg twice daily"], "allergies": [],
     "obs": [("PASI Score", "8", "points"), ("Joint Count", "4", "affected")]},
    
    {"name": "Barbara Jackson", "age": 61, "gender": "female", "conditions": ["Fibromyalgia", "Insomnia"], 
     "meds": ["Duloxetine 60mg daily", "Zolpidem 10mg at bedtime"], "allergies": ["Tramadol"],
     "obs": [("Pain Score", "6/10", ""), ("Sleep Quality", "Poor", "")]},
    
    {"name": "Steven White", "age": 53, "gender": "male", "conditions": ["Peripheral Neuropathy", "Vitamin D Deficiency"], 
     "meds": ["Gabapentin 300mg three times daily", "Vitamin D3 50000IU weekly"], "allergies": [],
     "obs": [("Vitamin D", "18", "ng/mL"), ("Neuropathy Score", "Moderate", "")]},
    
    {"name": "Nancy Harris", "age": 70, "gender": "female", "conditions": ["Glaucoma", "Hypertension"], 
     "meds": ["Latanoprost eye drops nightly", "Amlodipine 5mg daily"], "allergies": [],
     "obs": [("Intraocular Pressure", "18", "mmHg"), ("Blood Pressure", "138/82", "mmHg")]},
    
    {"name": "Paul Martin", "age": 44, "gender": "male", "conditions": ["Ulcerative Colitis", "Anemia of Chronic Disease"], 
     "meds": ["Mesalamine 800mg three times daily", "Iron Sucrose IV monthly"], "allergies": ["NSAIDs"],
     "obs": [("Hemoglobin", "10.8", "g/dL"), ("Calprotectin", "250", "µg/g")]},
    
    {"name": "Karen Thompson", "age": 59, "gender": "female", "conditions": ["Hypothyroidism", "Osteoarthritis"], 
     "meds": ["Levothyroxine 100mcg daily", "Acetaminophen 650mg as needed"], "allergies": [],
     "obs": [("TSH", "2.8", "mIU/L"), ("Free T4", "1.2", "ng/dL")]},
    
    {"name": "Mark Garcia", "age": 72, "gender": "male", "conditions": ["Benign Prostatic Hyperplasia", "Hypertension"], 
     "meds": ["Tamsulosin 0.4mg daily", "Losartan 50mg daily"], "allergies": [],
     "obs": [("PSA", "3.2", "ng/mL"), ("Post-void Residual", "85", "mL")]},
    
    {"name": "Sandra Martinez", "age": 48, "gender": "female", "conditions": ["Endometriosis", "Chronic Pelvic Pain"], 
     "meds": ["Norethindrone 5mg daily", "Ibuprofen 600mg as needed"], "allergies": [],
     "obs": [("Pain Score", "7/10", ""), ("CA-125", "45", "U/mL")]},
    
    {"name": "Jason Robinson", "age": 56, "gender": "male", "conditions": ["Epilepsy", "Hyperlipidemia"], 
     "meds": ["Levetiracetam 500mg twice daily", "Rosuvastatin 10mg daily"], "allergies": ["Phenytoin"],
     "obs": [("Seizure Frequency", "0 in 6 months", ""), ("LDL", "95", "mg/dL")]},
    
    {"name": "Michelle Clark", "age": 65, "gender": "female", "conditions": ["Polymyalgia Rheumatica", "Osteoporosis"], 
     "meds": ["Prednisone 10mg daily", "Calcium 1200mg daily"], "allergies": [],
     "obs": [("ESR", "22", "mm/hr"), ("Bone Density", "-2.5", "T-score")]},
    
    {"name": "Brian Lewis", "age": 41, "gender": "male", "conditions": ["Bipolar Disorder", "Metabolic Syndrome"], 
     "meds": ["Lithium 900mg daily", "Metformin 500mg twice daily"], "allergies": [],
     "obs": [("Lithium Level", "0.8", "mEq/L"), ("Fasting Glucose", "118", "mg/dL")]},
    
    {"name": "Deborah Lee", "age": 68, "gender": "female", "conditions": ["Chronic Pain Syndrome", "Anxiety"], 
     "meds": ["Tramadol 50mg as needed", "Buspirone 15mg twice daily"], "allergies": ["Morphine"],
     "obs": [("Pain Score", "5/10", ""), ("Anxiety Score", "Moderate", "")]},
    
    {"name": "Gary Walker", "age": 54, "gender": "male", "conditions": ["Diverticulosis", "IBS"], 
     "meds": ["Fiber supplement daily", "Dicyclomine 20mg as needed"], "allergies": [],
     "obs": [("Colonoscopy", "Multiple diverticula", ""), ("Symptom Frequency", "Weekly", "")]},
    
    {"name": "Carol Hall", "age": 63, "gender": "female", "conditions": ["Sjögren's Syndrome", "Dry Eye"], 
     "meds": ["Hydroxychloroquine 200mg twice daily", "Artificial tears as needed"], "allergies": [],
     "obs": [("Schirmer Test", "3mm", ""), ("Anti-SSA", "Positive", "")]},
    
    {"name": "Ronald Allen", "age": 57, "gender": "male", "conditions": ["Peripheral Artery Disease", "Hyperlipidemia"], 
     "meds": ["Cilostazol 100mg twice daily", "Atorvastatin 40mg daily", "Aspirin 81mg daily"], "allergies": [],
     "obs": [("ABI", "0.68", "ratio"), ("Claudication Distance", "200", "meters")]},
    
    {"name": "Dorothy Young", "age": 66, "gender": "female", "conditions": ["Restless Leg Syndrome", "Insomnia"], 
     "meds": ["Pramipexole 0.5mg at bedtime", "Melatonin 3mg nightly"], "allergies": [],
     "obs": [("IRLS Score", "18", "points"), ("Sleep Efficiency", "72", "%")]},
]

# Load into database
for idx, p_data in enumerate(patients_data):
    patient_id = f"P{idx+1:03d}"
    age = int(p_data["age"])
    
    # Create patient
    patient = Patient(
        id=patient_id,
        name=p_data["name"],
        gender=p_data["gender"],
        birth_date=f"{2024 - age}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
        risk_factors=", ".join(p_data["conditions"])
    )
    db.add(patient)
    db.flush()
    
    # Add conditions
    for cond_name in p_data["conditions"]:
        condition = Condition(
            patient_id=patient_id,
            name=cond_name,
            clinical_status="active",
            verification_status="confirmed"
        )
        db.add(condition)
    
    # Add medications
    for med_name in p_data["meds"]:
        medication = Medication(
            patient_id=patient_id,
            name=med_name,
            status="active"
        )
        db.add(medication)
    
    # Add allergies
    for allergy_name in p_data.get("allergies", []):
        allergy = Allergy(
            patient_id=patient_id,
            substance=allergy_name,
            reaction="Allergic reaction"
        )
        db.add(allergy)
    
    # Add observations
    for obs_code, obs_value, obs_unit in p_data["obs"]:
        observation = Observation(
            patient_id=patient_id,
            code=obs_code,
            value=obs_value,
            unit=obs_unit,
            date=f"2024-{random.randint(10,11):02d}-{random.randint(1,28):02d}"
        )
        db.add(observation)
    
    db.commit()
    if (idx + 1) % 10 == 0:
        print(f"  Created {idx + 1} patients...")

db.close()

print("\n[3/3] Complete!")
print("\n" + "=" * 60)
print(f"✓ SUCCESS! Created {len(patients_data)} DIVERSE patients")
print("=" * 60)
print("\nPatient Variety:")
print("- 30 unique names")
print("- 40+ different medical conditions")
print("- 50+ unique medications")
print("- Varied observations and lab results")
print("\nYou can now:")
print("1. Refresh your browser at http://localhost:3000")
print("2. Select any patient by name")
print("3. Ask about their specific conditions and medications")
