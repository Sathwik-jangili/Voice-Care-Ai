import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Try the experimental model
try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Say hello in one sentence")
    print(f"SUCCESS with gemini-2.0-flash-exp: {response.text}")
except Exception as e:
    print(f"FAILED with gemini-2.0-flash-exp: {e}")

# Try pro model
try:
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content("Say hello in one sentence")
    print(f"SUCCESS with gemini-1.5-pro: {response.text}")
except Exception as e:
    print(f"FAILED with gemini-1.5-pro: {e}")
