import requests
from sqlalchemy.orm import Session
from .. import models, database

FHIR_SERVER_URL = "http://hapi.fhir.org/baseR4"

def fetch_patients_from_fhir(db: Session, limit: int = 20):
    # Fetch patients
    response = requests.get(f"{FHIR_SERVER_URL}/Patient?_count={limit}")
    if response.status_code != 200:
        print(f"Error fetching patients: {response.status_code}")
        return

    bundle = response.json()
    if 'entry' not in bundle:
        print("No patients found")
        return

    count = 0
    for entry in bundle['entry']:
        resource = entry['resource']
        patient_id = resource.get('id')
        
        # Check if patient already exists
        existing = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
        if existing:
            continue

        name_data = resource.get('name', [{}])[0]
        name = f"{name_data.get('given', [''])[0]} {name_data.get('family', '')}".strip()
        gender = resource.get('gender', 'unknown')
        birth_date = resource.get('birthDate', 'unknown')

        patient = models.Patient(
            id=patient_id,
            name=name,
            gender=gender,
            birth_date=birth_date
        )
        db.add(patient)
        db.commit() # Commit to get ID for relationships
        
        fetch_patient_details(db, patient_id)
        count += 1
        print(f"Imported patient: {name} ({patient_id})")

    return count

def fetch_patient_details(db: Session, patient_id: str):
    # Fetch Conditions
    resp = requests.get(f"{FHIR_SERVER_URL}/Condition?patient={patient_id}")
    if resp.status_code == 200:
        data = resp.json()
        if 'entry' in data:
            for entry in data['entry']:
                res = entry['resource']
                condition = models.Condition(
                    patient_id=patient_id,
                    name=res.get('code', {}).get('text', 'Unknown Condition'),
                    clinical_status=res.get('clinicalStatus', {}).get('coding', [{}])[0].get('code', 'unknown'),
                    verification_status=res.get('verificationStatus', {}).get('coding', [{}])[0].get('code', 'unknown')
                )
                db.add(condition)

    # Fetch Medications (MedicationRequest)
    resp = requests.get(f"{FHIR_SERVER_URL}/MedicationRequest?patient={patient_id}")
    if resp.status_code == 200:
        data = resp.json()
        if 'entry' in data:
            for entry in data['entry']:
                res = entry['resource']
                medication = models.Medication(
                    patient_id=patient_id,
                    name=res.get('medicationCodeableConcept', {}).get('text', 'Unknown Medication'),
                    status=res.get('status', 'unknown')
                )
                db.add(medication)

    # Fetch Allergies (AllergyIntolerance)
    resp = requests.get(f"{FHIR_SERVER_URL}/AllergyIntolerance?patient={patient_id}")
    if resp.status_code == 200:
        data = resp.json()
        if 'entry' in data:
            for entry in data['entry']:
                res = entry['resource']
                reaction_text = "Unknown"
                if 'reaction' in res and len(res['reaction']) > 0:
                    reaction_text = res['reaction'][0].get('manifestation', [{}])[0].get('text', 'Unknown')
                
                allergy = models.Allergy(
                    patient_id=patient_id,
                    substance=res.get('code', {}).get('text', 'Unknown Substance'),
                    reaction=reaction_text
                )
                db.add(allergy)

    db.commit()
