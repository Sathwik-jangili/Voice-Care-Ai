from fastapi import APIRouter, Form, Depends
from sqlalchemy.orm import Session
from sqlalchemy import inspect
from .. import database, models
from datetime import datetime

router = APIRouter()

# Ensure table exists on first use
def ensure_table_exists(db: Session):
    try:
        inspector = inspect(database.engine)
        existing_tables = inspector.get_table_names()
        if 'journal_entries' not in existing_tables:
            models.JournalEntry.__table__.create(bind=database.engine, checkfirst=True)
            print("Created journal_entries table")
    except Exception as e:
        print(f"Warning: Could not ensure journal_entries table exists: {e}")

@router.post("/entry")
def create_journal_entry(
    title: str = Form(...),
    content: str = Form(...),
    mood: str = Form(None),
    tags: str = Form(None),
    patient_id: str = Form(None),
    db: Session = Depends(database.get_db)
):
    # Ensure table exists
    ensure_table_exists(db)
    entry = models.JournalEntry(
        patient_id=patient_id,
        title=title,
        content=content,
        mood=mood,
        tags=tags
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    return {
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "mood": entry.mood,
        "tags": entry.tags,
        "createdDate": entry.created_date.isoformat()
    }

@router.get("/entries/{patient_id}")
def get_journal_entries(patient_id: str, db: Session = Depends(database.get_db)):
    # Ensure table exists
    ensure_table_exists(db)
    entries = db.query(models.JournalEntry).filter(
        models.JournalEntry.patient_id == patient_id
    ).order_by(models.JournalEntry.created_date.desc()).all()

    return [{
        "id": e.id,
        "title": e.title,
        "content": e.content,
        "mood": e.mood,
        "tags": e.tags,
        "createdDate": e.created_date.isoformat(),
        "updatedDate": e.updated_date.isoformat()
    } for e in entries]

@router.get("/entry/{entry_id}")
def get_journal_entry(entry_id: int, db: Session = Depends(database.get_db)):
    entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    if not entry:
        return {"error": "Entry not found"}
    
    return {
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "mood": entry.mood,
        "tags": entry.tags,
        "createdDate": entry.created_date.isoformat(),
        "updatedDate": entry.updated_date.isoformat()
    }

@router.put("/entry/{entry_id}")
def update_journal_entry(
    entry_id: int,
    title: str = Form(None),
    content: str = Form(None),
    mood: str = Form(None),
    tags: str = Form(None),
    db: Session = Depends(database.get_db)
):
    entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    if not entry:
        return {"error": "Entry not found"}
    
    if title:
        entry.title = title
    if content:
        entry.content = content
    if mood:
        entry.mood = mood
    if tags:
        entry.tags = tags
    
    entry.updated_date = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    
    return {
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "mood": entry.mood,
        "tags": entry.tags,
        "updatedDate": entry.updated_date.isoformat()
    }

@router.delete("/entry/{entry_id}")
def delete_journal_entry(entry_id: int, db: Session = Depends(database.get_db)):
    entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    if not entry:
        return {"error": "Entry not found"}
    
    db.delete(entry)
    db.commit()
    
    return {"message": "Entry deleted successfully"}
