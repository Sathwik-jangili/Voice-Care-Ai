from fastapi import APIRouter, Form, Depends
from sqlalchemy.orm import Session
from sqlalchemy import inspect
from .. import database, models
from ..services import ai_service
import json

router = APIRouter()

# Ensure table exists on first use
def ensure_table_exists(db: Session):
    try:
        inspector = inspect(database.engine)
        existing_tables = inspector.get_table_names()
        if 'guide_searches' not in existing_tables:
            models.GuideSearch.__table__.create(bind=database.engine, checkfirst=True)
            print("Created guide_searches table")
    except Exception as e:
        print(f"Warning: Could not ensure guide_searches table exists: {e}")

@router.post("/search")
def search_guide(
    topic: str = Form(...),
    patient_id: str = Form(None),
    db: Session = Depends(database.get_db)
):
    # Ensure table exists
    ensure_table_exists(db)
    # Get AI explanation with structured prompt
    prompt = f"""Explain {topic} in simple terms for a patient. Include:
1. What it is
2. Why it matters
3. General guidance

Then provide 3-5 actionable next steps as a numbered list starting with "Next Steps:" or "Recommended Actions:".
Format the next steps clearly, one per line."""
    
    response_text = ai_service.generate_response(patient_id or "general", prompt, db)
    
    # Extract next steps from AI response
    next_steps = []
    lines = response_text.split('\n')
    in_next_steps = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Look for "Next Steps:" or "Recommended Actions:" markers
        if "next steps" in line.lower() or "recommended actions" in line.lower() or "action items" in line.lower():
            in_next_steps = True
            continue
        # If we're in next steps section, extract numbered or bulleted items
        if in_next_steps:
            # Remove numbering/bullets and clean up
            cleaned = line.lstrip('0123456789.-•* ').strip()
            if cleaned and len(cleaned) > 10:  # Only add substantial items
                next_steps.append(cleaned)
                if len(next_steps) >= 5:  # Limit to 5 steps
                    break
    
    # Fallback to default steps if none extracted
    if not next_steps:
        next_steps = [
            "Consult with your healthcare provider",
            "Monitor your symptoms",
            "Follow prescribed treatment plan"
        ]
    
    # Save to database
    guide_search = models.GuideSearch(
        patient_id=patient_id,
        topic=topic,
        explanation=response_text,
        next_steps=json.dumps(next_steps)
    )
    db.add(guide_search)
    db.commit()
    db.refresh(guide_search)
    
    return {
        "id": guide_search.id,
        "explanation": response_text,
        "nextSteps": next_steps
    }
@router.get("/history/{patient_id}")
def get_guide_history(patient_id: str, db: Session = Depends(database.get_db)):
    searches = db.query(models.GuideSearch).filter(
        models.GuideSearch.patient_id == patient_id
    ).order_by(models.GuideSearch.created_date.desc()).limit(20).all()

    return [
        {
            "id": s.id,
            "topic": s.topic,
            "explanation": s.explanation,
            "nextSteps": json.loads(s.next_steps) if s.next_steps else [],
            "createdDate": s.created_date.isoformat()
        }
        for s in searches
    ]
