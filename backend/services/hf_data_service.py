from datasets import load_dataset
import pandas as pd
from sqlalchemy.orm import Session
from .. import models

def fetch_medical_dataset():
    """
    Fetch medical dataset from Hugging Face.
    Using a diabetes dataset as an example - can be swapped with other medical datasets.
    """
    try:
        # Try loading a medical dataset
        # Option 1: Diabetes dataset
        dataset = load_dataset("imodels/diabetes-hospital-readmission", split="train")
        df = pd.DataFrame(dataset)
        
        # Limit to 30 patients
        df = df.head(30)
        
        return df, "diabetes"
    except Exception as e:
        print(f"Error loading diabetes dataset: {e}")
        try:
            # Option 2: Stroke dataset
            dataset = load_dataset("alphagov/stroke-data", split="train")
            df = pd.DataFrame(dataset)
            df = df.head(30)
            return df, "stroke"
        except Exception as e2:
            print(f"Error loading stroke dataset: {e2}")
            return None, None

def transform_to_patients(df, dataset_type, db: Session):
    """
    Transform HF dataset to our database schema.
    """
    patients_created = 0
    
    for idx, row in df.iterrows():
        patient_id = f"HF{idx:03d}"
        
        # Extract patient info based on dataset type
        if dataset_type == "diabetes":
            name = f"Patient {idx + 1}"
            gender = row.get('gender', 'Unknown')
            age = row.get('age', 'Unknown')
            
            # Create patient
            patient = models.Patient(
                id=patient_id,
                name=name,
                gender=gender if gender != '[Unknown]' else 'unknown',
                birth_date=f"{2024 - int(age) if age != '[Unknown]' else 1970}-01-01",
                risk_factors=f"Readmission risk, {row.get('race', 'Unknown')} ethnicity"
            )
            db.add(patient)
            db.commit()
            
            # Add condition
            condition = models.Condition(
                patient_id=patient_id,
                name="Diabetes Mellitus",
                clinical_status="active",
                verification_status="confirmed"
            )
            db.add(condition)
            
            # Add medications if available
            if 'num_medications' in row and row['num_medications'] > 0:
                medication = models.Medication(
                    patient_id=patient_id,
                    name=f"{row['num_medications']} diabetes medications",
                    status="active"
                )
                db.add(medication)
            
            # Add observation
            if 'time_in_hospital' in row:
                observation = models.Observation(
                    patient_id=patient_id,
                    code="Hospital Stay Duration",
                    value=str(row['time_in_hospital']),
                    unit="days",
                    date="2024-11-01"
                )
                db.add(observation)
                
        elif dataset_type == "stroke":
            # Similar transformation for stroke data
            name = f"Patient {idx + 1}"
            gender = row.get('gender', 'Unknown')
            age = row.get('age', 50)
            
            patient = models.Patient(
                id=patient_id,
                name=name,
                gender=gender.lower() if gender != 'Unknown' else 'unknown',
                birth_date=f"{2024 - int(age)}-01-01",
                risk_factors=f"Stroke risk, {row.get('smoking_status', 'Unknown')}"
            )
            db.add(patient)
            db.commit()
            
            # Add stroke condition if applicable
            if row.get('stroke', 0) == 1:
                condition = models.Condition(
                    patient_id=patient_id,
                    name="Stroke",
                    clinical_status="active",
                    verification_status="confirmed"
                )
                db.add(condition)
            
            # Add hypertension if applicable
            if row.get('hypertension', 0) == 1:
                condition = models.Condition(
                    patient_id=patient_id,
                    name="Hypertension",
                    clinical_status="active",
                    verification_status="confirmed"
                )
                db.add(condition)
        
        db.commit()
        patients_created += 1
        print(f"Created patient: {name} ({patient_id})")
    
    return patients_created
