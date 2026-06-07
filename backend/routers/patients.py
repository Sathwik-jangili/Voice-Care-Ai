from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models
from ..services import fhir_service

router = APIRouter()

@router.get("/test")
def test_db(db: Session = Depends(database.get_db)):
    """Test database connection"""
    try:
        from sqlalchemy import text
        result = db.execute(text("SELECT COUNT(*) FROM patients"))
        count = result.scalar()
        return {"status": "ok", "patient_count": count, "message": "Database connection working"}
    except Exception as e:
        import traceback
        return {"status": "error", "error": str(e), "traceback": traceback.format_exc()}

@router.post("/fetch")
def fetch_patients(limit: int = 20, db: Session = Depends(database.get_db)):
    count = fhir_service.fetch_patients_from_fhir(db, limit)
    return {"message": f"Successfully fetched {count} patients"}

@router.get("/")
def list_patients(db: Session = Depends(database.get_db)):
    try:
        patients = db.query(models.Patient).all()
        result = []
        for p in patients:
            result.append({
                "id": p.id,
                "name": p.name or "Unknown",
                "gender": p.gender or "Unknown",
                "birth_date": p.birth_date or ""
            })
        return result
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in list_patients: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Error fetching patients: {str(e)}")

@router.get("/{patient_id}")
def get_patient(patient_id: str, db: Session = Depends(database.get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "id": patient.id,
        "name": patient.name,
        "gender": patient.gender,
        "birth_date": patient.birth_date,
        "conditions": [c.name for c in patient.conditions],
        "medications": [m.name for m in patient.medications],
        "allergies": [a.substance for a in patient.allergies],
        "observations": [] # Can add later
    }
