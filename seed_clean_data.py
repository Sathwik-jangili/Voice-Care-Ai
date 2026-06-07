import sys
sys.path.insert(0, 'c:/Users/Sathwik Jangili/OneDrive/Documents/voice-care-ai-persona')

from backend.database import SessionLocal
from backend.models import Patient, Condition, Medication, Allergy, Observation

# Clear existing data
db = SessionLocal()
db.query(Observation).delete()
db.query(Allergy).delete()
db.query(Medication).delete()
db.query(Condition).delete()
db.query(Patient).delete()
db.commit()

# Create realistic patients
patients_data = [
    {
        "id": "P001",
        "name": "John Smith",
        "gender": "male",
        "birth_date": "1958-03-15",
        "conditions": [
            {"name": "Type 2 Diabetes Mellitus", "clinical_status": "active", "verification_status": "confirmed"},
            {"name": "Hypertension", "clinical_status": "active", "verification_status": "confirmed"},
        ],
        "medications": [
            {"name": "Metformin 500mg twice daily", "status": "active"},
            {"name": "Lisinopril 10mg once daily", "status": "active"},
        ],
        "allergies": [
            {"substance": "Penicillin", "reaction": "Rash"},
        ],
        "observations": [
            {"code": "Blood Pressure", "value": "135/85", "unit": "mmHg", "date": "2024-11-20"},
            {"code": "Blood Glucose", "value": "145", "unit": "mg/dL", "date": "2024-11-20"},
            {"code": "HbA1c", "value": "7.2", "unit": "%", "date": "2024-11-15"},
        ]
    },
    {
        "id": "P002",
        "name": "Sarah Johnson",
        "gender": "female",
        "birth_date": "1975-07-22",
        "conditions": [
            {"name": "Asthma", "clinical_status": "active", "verification_status": "confirmed"},
            {"name": "Seasonal Allergies", "clinical_status": "active", "verification_status": "confirmed"},
        ],
        "medications": [
            {"name": "Albuterol Inhaler as needed", "status": "active"},
            {"name": "Fluticasone 110mcg twice daily", "status": "active"},
            {"name": "Cetirizine 10mg once daily", "status": "active"},
        ],
        "allergies": [
            {"substance": "Pollen", "reaction": "Sneezing, watery eyes"},
            {"substance": "Dust mites", "reaction": "Wheezing"},
        ],
        "observations": [
            {"code": "Peak Flow", "value": "380", "unit": "L/min", "date": "2024-11-18"},
            {"code": "Oxygen Saturation", "value": "98", "unit": "%", "date": "2024-11-18"},
        ]
    },
    {
        "id": "P003",
        "name": "Michael Chen",
        "gender": "male",
        "birth_date": "1982-11-30",
        "conditions": [
            {"name": "Gastroesophageal Reflux Disease (GERD)", "clinical_status": "active", "verification_status": "confirmed"},
            {"name": "Anxiety Disorder", "clinical_status": "active", "verification_status": "confirmed"},
        ],
        "medications": [
            {"name": "Omeprazole 20mg once daily", "status": "active"},
            {"name": "Sertraline 50mg once daily", "status": "active"},
        ],
        "allergies": [
            {"substance": "Sulfa drugs", "reaction": "Hives"},
        ],
        "observations": [
            {"code": "Weight", "value": "82", "unit": "kg", "date": "2024-11-10"},
            {"code": "Heart Rate", "value": "72", "unit": "bpm", "date": "2024-11-10"},
        ]
    },
    {
        "id": "P004",
        "name": "Emily Rodriguez",
        "gender": "female",
        "birth_date": "1990-05-08",
        "conditions": [
            {"name": "Migraine", "clinical_status": "active", "verification_status": "confirmed"},
            {"name": "Iron Deficiency Anemia", "clinical_status": "active", "verification_status": "confirmed"},
        ],
        "medications": [
            {"name": "Sumatriptan 50mg as needed", "status": "active"},
            {"name": "Ferrous Sulfate 325mg once daily", "status": "active"},
        ],
        "allergies": [],
        "observations": [
            {"code": "Hemoglobin", "value": "11.5", "unit": "g/dL", "date": "2024-11-12"},
            {"code": "Ferritin", "value": "18", "unit": "ng/mL", "date": "2024-11-12"},
        ]
    },
    {
        "id": "P005",
        "name": "Robert Williams",
        "gender": "male",
        "birth_date": "1965-09-14",
        "conditions": [
            {"name": "Osteoarthritis", "clinical_status": "active", "verification_status": "confirmed"},
            {"name": "High Cholesterol", "clinical_status": "active", "verification_status": "confirmed"},
        ],
        "medications": [
            {"name": "Ibuprofen 400mg as needed", "status": "active"},
            {"name": "Atorvastatin 20mg once daily", "status": "active"},
            {"name": "Glucosamine 1500mg once daily", "status": "active"},
        ],
        "allergies": [
            {"substance": "Aspirin", "reaction": "Stomach upset"},
        ],
        "observations": [
            {"code": "Total Cholesterol", "value": "210", "unit": "mg/dL", "date": "2024-11-05"},
            {"code": "LDL Cholesterol", "value": "130", "unit": "mg/dL", "date": "2024-11-05"},
            {"code": "HDL Cholesterol", "value": "45", "unit": "mg/dL", "date": "2024-11-05"},
        ]
    }
]

# Insert data
for p_data in patients_data:
    patient = Patient(
        id=p_data["id"],
        name=p_data["name"],
        gender=p_data["gender"],
        birth_date=p_data["birth_date"]
    )
    db.add(patient)
    db.commit()
    
    for c in p_data["conditions"]:
        condition = Condition(
            patient_id=patient.id,
            name=c["name"],
            clinical_status=c["clinical_status"],
            verification_status=c["verification_status"]
        )
        db.add(condition)
    
    for m in p_data["medications"]:
        medication = Medication(
            patient_id=patient.id,
            name=m["name"],
            status=m["status"]
        )
        db.add(medication)
    
    for a in p_data["allergies"]:
        allergy = Allergy(
            patient_id=patient.id,
            substance=a["substance"],
            reaction=a["reaction"]
        )
        db.add(allergy)
    
    for o in p_data["observations"]:
        observation = Observation(
            patient_id=patient.id,
            code=o["code"],
            value=o["value"],
            unit=o["unit"],
            date=o["date"]
        )
        db.add(observation)
    
    db.commit()
    print(f"Created patient: {patient.name}")

db.close()
print(f"\n✓ Successfully created {len(patients_data)} patients with complete data!")
