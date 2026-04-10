import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Write available models to JSON
models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
with open('models.json', 'w', encoding='utf-8') as f:
    json.dump(models, f)
