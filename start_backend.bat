@echo off
cd /d "C:\Users\Sathwik Jangili\OneDrive\Documents\voice-care-ai-persona"
echo Starting backend server...
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
pause

