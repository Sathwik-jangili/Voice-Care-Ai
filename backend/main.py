from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from .database import engine, Base
from .routers import patients, ai, guide, navigator, journal

# Import all models to ensure they're registered with Base
from . import models

# Create tables on startup (non-blocking - tables will be created on first use if this fails)
def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized")
    except Exception as e:
        # Don't block server startup if database is locked
        # Tables will be created lazily on first use
        print(f"Warning: Could not create tables on startup: {e}")
        print("Tables will be created automatically when you use the features")

# Create tables when the app starts (non-blocking)
try:
    create_tables()
except Exception:
    # Server should still start even if table creation fails
    pass

app = FastAPI(title="Voice Care AI Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(guide.router, prefix="/guide", tags=["guide"])
app.include_router(navigator.router, prefix="/navigator", tags=["navigator"])
app.include_router(journal.router, prefix="/journal", tags=["journal"])

@app.get("/")
def read_root():
    return {"message": "Voice Care AI Backend is running"}

@app.post("/admin/create-tables")
def create_missing_tables():
    """Create missing database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        return {"message": "All tables created successfully", "status": "success"}
    except Exception as e:
        return {"message": f"Error creating tables: {str(e)}", "status": "error"}
