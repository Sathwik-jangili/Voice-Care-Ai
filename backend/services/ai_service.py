import os
import google.generativeai as genai
from sqlalchemy.orm import Session
from .. import models

# Initialize Gemini
# Ensure GOOGLE_API_KEY is set in environment variables
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('models/gemini-2.5-flash')
else:
    model = None

def generate_response(patient_id: str, transcript: str, db: Session):
    if not model:
        return "Google API key is missing. Please set GOOGLE_API_KEY in the .env file."

    # Handle general queries (no specific patient)
    if patient_id == "general" or patient_id == "unknown" or not patient_id:
        system_prompt = """
    You are a helpful medical assistant providing general health information and guidance.
    
    INSTRUCTIONS:
    1. Provide clear, accurate, and empathetic responses to health-related questions.
    2. Always emphasize that your advice is general and not a substitute for professional medical care.
    3. RED FLAGS: If the user mentions chest pain, fainting, difficulty breathing, or heavy bleeding, immediately advise them to seek emergency care.
    4. Keep answers concise, informative, and easy to understand.
    5. When appropriate, suggest consulting with a healthcare provider.
    """
    else:
        # Fetch patient context
        patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
        if not patient:
            # Fall back to general mode if patient not found
            system_prompt = """
    You are a helpful medical assistant providing general health information and guidance.
    
    INSTRUCTIONS:
    1. Provide clear, accurate, and empathetic responses to health-related questions.
    2. Always emphasize that your advice is general and not a substitute for professional medical care.
    3. RED FLAGS: If the user mentions chest pain, fainting, difficulty breathing, or heavy bleeding, immediately advise them to seek emergency care.
    4. Keep answers concise, informative, and easy to understand.
    5. When appropriate, suggest consulting with a healthcare provider.
    """
        else:
            conditions = ", ".join([c.name for c in patient.conditions]) or "None"
            medications = ", ".join([m.name for m in patient.medications]) or "None"
            allergies = ", ".join([a.substance for a in patient.allergies]) or "None"

            system_prompt = f"""
    You are a medical assistant for a specific patient.
    
    PATIENT DATA:
    Name: {patient.name}
    Gender: {patient.gender}
    Conditions: {conditions}
    Medications: {medications}
    Allergies: {allergies}

    INSTRUCTIONS:
    1. Answer the user's question based STRICTLY on the patient's recorded data above.
    2. If the user asks about a condition not listed above, say: "This condition is not recorded for this patient. Please consult a clinician."
    3. RED FLAGS: If the user mentions chest pain, fainting, difficulty breathing, or heavy bleeding, IGNORE the data restriction and immediately advise them to seek emergency care.
    4. Keep answers concise and empathetic.
    """

    try:
        # Combine system prompt and user query
        full_prompt = f"{system_prompt}\n\nUser question: {transcript}\n\nPlease provide a helpful response:"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        import traceback
        print(f"Error generating response: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        return f"I'm sorry, I'm having trouble connecting to the AI service right now. Error: {str(e)}"
