from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True) # FHIR IDs are strings
    name = Column(String)
    gender = Column(String)
    birth_date = Column(String)
    risk_factors = Column(Text)  # NEW: Store risk factors as JSON or comma-separated
    
    conditions = relationship("Condition", back_populates="patient")
    medications = relationship("Medication", back_populates="patient")
    allergies = relationship("Allergy", back_populates="patient")
    observations = relationship("Observation", back_populates="patient")
    interactions = relationship("Interaction", back_populates="patient")
    symptoms_history = relationship("SymptomsHistory", back_populates="patient")
    medical_notes = relationship("MedicalNote", back_populates="patient")
    audio_logs = relationship("AudioLog", back_populates="patient")

class Condition(Base):
    __tablename__ = "conditions"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    name = Column(String)
    clinical_status = Column(String)
    verification_status = Column(String)
    patient = relationship("Patient", back_populates="conditions")

class Medication(Base):
    __tablename__ = "medications"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    name = Column(String)
    status = Column(String)
    patient = relationship("Patient", back_populates="medications")

class Allergy(Base):
    __tablename__ = "allergies"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    substance = Column(String)
    reaction = Column(String)
    patient = relationship("Patient", back_populates="allergies")

class Observation(Base):
    __tablename__ = "observations"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    code = Column(String)
    value = Column(String)
    unit = Column(String)
    date = Column(String)
    patient = relationship("Patient", back_populates="observations")

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    transcript = Column(Text)
    ai_response = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="interactions")

class SymptomsHistory(Base):
    __tablename__ = "symptoms_history"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    symptom = Column(String)
    severity = Column(String)  # mild, moderate, severe
    date_reported = Column(String)
    patient = relationship("Patient", back_populates="symptoms_history")

class MedicalNote(Base):
    __tablename__ = "medical_notes"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    note_type = Column(String)  # e.g., "Progress Note", "Consultation"
    content = Column(Text)
    created_date = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="medical_notes")

class AudioLog(Base):
    __tablename__ = "audio_logs"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    transcript = Column(Text)
    duration_seconds = Column(Integer)
    recorded_date = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="audio_logs")

class GuideSearch(Base):
    __tablename__ = "guide_searches"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    topic = Column(String)
    explanation = Column(Text)
    next_steps = Column(Text)  # JSON array stored as text
    created_date = Column(DateTime, default=datetime.utcnow)

class NavigatorQuery(Base):
    __tablename__ = "navigator_queries"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    query = Column(Text)
    what_to_expect = Column(Text)  # JSON array
    things_to_bring = Column(Text)  # JSON array
    questions_to_ask = Column(Text)  # JSON array
    notes = Column(Text)
    created_date = Column(DateTime, default=datetime.utcnow)

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    title = Column(String)
    content = Column(Text)
    mood = Column(String, nullable=True)
    tags = Column(Text, nullable=True)  # Comma-separated tags
    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
