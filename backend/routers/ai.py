from fastapi import APIRouter, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models
from ..services import ai_service

router = APIRouter()

@router.post("/ask")
def ask_question(
    transcript: str = Form(...), 
    patient_id: str = Form(...), 
    db: Session = Depends(database.get_db)
):
    try:
        response_text = ai_service.generate_response(patient_id, transcript, db)
        
        # Log interaction
        try:
            interaction = models.Interaction(
                patient_id=patient_id,
                transcript=transcript,
                ai_response=response_text
            )
            db.add(interaction)
            db.commit()
        except Exception as e:
            # Don't fail if logging fails
            print(f"Warning: Could not log interaction: {e}")

        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
