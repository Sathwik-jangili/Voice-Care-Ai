import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Get all models that support generateContent
models_to_try = []
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        models_to_try.append(m.name)
        print(f"Found: {m.name}")

# Try each one
for model_name in models_to_try[:3]:  # Test first 3
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello")
        print(f"✓ SUCCESS with {model_name}: {response.text[:50]}")
        break
    except Exception as e:
        print(f"✗ FAILED with {model_name}: {str(e)[:100]}")
