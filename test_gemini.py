import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key loaded: {api_key[:20]}..." if api_key else "API Key: NOT FOUND")

if api_key:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    try:
        response = model.generate_content("Say hello")
        print(f"Gemini Response: {response.text}")
    except Exception as e:
        print(f"Error calling Gemini: {e}")
else:
    print("Cannot test Gemini without API key")
