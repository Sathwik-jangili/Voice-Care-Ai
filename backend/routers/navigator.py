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
        if 'navigator_queries' not in existing_tables:
            models.NavigatorQuery.__table__.create(bind=database.engine, checkfirst=True)
            print("Created navigator_queries table")
    except Exception as e:
        print(f"Warning: Could not ensure navigator_queries table exists: {e}")

@router.post("/query")
def query_navigator(
    query: str = Form(...),
    patient_id: str = Form(None),
    db: Session = Depends(database.get_db)
):
    # Ensure table exists
    ensure_table_exists(db)
    # Get AI guidance with structured prompt
    prompt = f"""For the following health concern: "{query}", provide comprehensive guidance structured as follows:

1. WHAT TO EXPECT: List 3-5 things the person should expect during their medical visit or process. Start with "WHAT TO EXPECT:" or "What to Expect:"

2. THINGS TO BRING: List 3-5 items they should bring to appointments. Start with "THINGS TO BRING:" or "Things to Bring:"

3. QUESTIONS TO ASK: List 3-5 important questions they should ask their healthcare provider. Start with "QUESTIONS TO ASK:" or "Questions to Ask:"

4. ADDITIONAL NOTES: Provide any other relevant guidance or reminders.

Format each section clearly with the section header, then list items one per line."""
    
    response_text = ai_service.generate_response(patient_id or "general", prompt, db)
    
    # Parse structured response
    what_to_expect = []
    things_to_bring = []
    questions_to_ask = []
    notes = []
    
    lines = response_text.split('\n')
    current_section = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Detect section headers
        line_lower = line.lower()
        if "what to expect" in line_lower:
            current_section = "expect"
            continue
        elif "things to bring" in line_lower or "what to bring" in line_lower:
            current_section = "bring"
            continue
        elif "questions to ask" in line_lower:
            current_section = "questions"
            continue
        elif "additional notes" in line_lower or "notes:" in line_lower or "other guidance" in line_lower:
            current_section = "notes"
            continue
        
        # Extract items based on current section
        if current_section == "expect":
            cleaned = line.lstrip('0123456789.-•* ').strip()
            if cleaned and len(cleaned) > 10:
                what_to_expect.append(cleaned)
        elif current_section == "bring":
            cleaned = line.lstrip('0123456789.-•* ').strip()
            if cleaned and len(cleaned) > 5:
                things_to_bring.append(cleaned)
        elif current_section == "questions":
            cleaned = line.lstrip('0123456789.-•* ').strip()
            if cleaned and len(cleaned) > 10:
                questions_to_ask.append(cleaned)
        elif current_section == "notes":
            notes.append(line)
    
    # Fallback to defaults if parsing failed
    if not what_to_expect:
        what_to_expect = [
            "Initial consultation with healthcare provider",
            "Possible diagnostic tests or examinations",
            "Discussion of treatment options",
            "Follow-up appointment scheduling"
        ]
    
    if not things_to_bring:
        things_to_bring = [
            "Insurance card and ID",
            "List of current medications",
            "Recent test results or medical records",
            "Questions or concerns written down"
        ]
    
    if not questions_to_ask:
        questions_to_ask = [
            "What is causing my symptoms?",
            "What treatment options are available?",
            "What are the potential side effects?",
            "When should I expect to see improvement?"
        ]
    
    # Combine notes or use full response if no structured notes
    notes_text = "\n".join(notes) if notes else response_text
    
    # Save to database
    nav_query = models.NavigatorQuery(
        patient_id=patient_id,
        query=query,
        what_to_expect=json.dumps(what_to_expect),
        things_to_bring=json.dumps(things_to_bring),
        questions_to_ask=json.dumps(questions_to_ask),
        notes=notes_text
    )
    db.add(nav_query)
    db.commit()
    db.refresh(nav_query)
    
    return {
        "id": nav_query.id,
        "whatToExpect": what_to_expect,
        "thingsToBring": things_to_bring,
        "questionsToAsk": questions_to_ask,
        "notes": notes_text
    }

@router.get("/history/{patient_id}")
def get_navigator_history(patient_id: str, db: Session = Depends(database.get_db)):
    queries = db.query(models.NavigatorQuery).filter(
        models.NavigatorQuery.patient_id == patient_id
    ).order_by(models.NavigatorQuery.created_date.desc()).limit(20).all()
    
    return [{
        "id": q.id,
        "query": q.query,
        "whatToExpect": json.loads(q.what_to_expect) if q.what_to_expect else [],
        "thingsToBring": json.loads(q.things_to_bring) if q.things_to_bring else [],
        "questionsToAsk": json.loads(q.questions_to_ask) if q.questions_to_ask else [],
        "notes": q.notes,
        "createdDate": q.created_date.isoformat()
    } for q in queries]
