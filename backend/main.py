import os
import asyncio
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import prompts

# Load environment variables
load_dotenv()

app = FastAPI(title="De-AIfy Pro API")

# Configure CORS for Vite frontend (allow all local ports for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HumanizeRequest(BaseModel):
    text: str
    level: str = "balanced" # light, balanced, deep
    tone: str = "academic"
    detectionReport: str = ""

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"status": "De-AIfy Pro Engine Running"}

@app.post("/api/analyze")
async def analyze_text(req: AnalyzeRequest):
    """
    Real AI Detection endpoint. Uses Gemini as a highly intelligent "Judge".
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        await asyncio.sleep(1)
        words = len(req.text.split())
        ai_score = random.randint(0, 15) if words > 50 else random.randint(40, 90)
        return {
            "aiLikeness": ai_score,
            "plagiarism": 0,
            "report": "MOCK MODE: Please add GEMINI_API_KEY to see real AI analysis."
        }

    try:
        import google.generativeai as genai
        import json
        genai.configure(api_key=api_key)
        
        system_prompt = prompts.get_detection_prompt()
        
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction=system_prompt
        )
        
        response = await model.generate_content_async(
            req.text,
            generation_config=genai.GenerationConfig(
                temperature=0.0,  # Pure zero temperature for absolute deterministic scoring
                response_mime_type="application/json"
            )
        )
        
        result = json.loads(response.text)
        score = int(result.get("ai_score", 0))
        raw_report = result.get("report", "Analysis complete.")
        
        return {
            "aiLikeness": score,
            "plagiarism": 0,  # Mocked, as we don't have internet access to scan real plagiarism databases
            "report": f"AI Probability Score: {score}% AI-Generated\n\n{raw_report}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/humanize")
async def humanize_text(req: HumanizeRequest):
    """
    Core humanization endpoint. Uses OpenAI (if key provided) or a robust mock.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    # For prototype functionality without spending API credits, we provide a sophisticated mock if no key
    if not api_key:
        await asyncio.sleep(2)
        system_prompt = prompts.get_humanization_prompt(req.level, req.tone)
        # Mock humanization
        sentences = req.text.split('. ')
        humanized = []
        for s in sentences:
            if s:
                humanized.append(f"[Engine: {req.tone.capitalize()}] {s}")
        return {
            "humanizedText": ". ".join(humanized) + ".",
            "usedMock": True,
            "message": "Add GEMINI_API_KEY to .env for actual AI processing."
        }
    
    # Real Gemini Integration
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        system_prompt = prompts.get_humanization_prompt(req.level, req.tone)
        
        # User's specific API key has access to next-generation models!
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction=system_prompt
        )
        
        # Inject the detection report into the payload if the user provided it
        combined_prompt = req.text
        if req.detectionReport and req.detectionReport.strip():
            combined_prompt = f"Here is the user's original text:\n\n{req.text}\n\n" \
                              f"CRITICAL CONTEXT - The AI Detector flagged the following sections/report:\n" \
                              f"{req.detectionReport}\n\n" \
                              f"You MUST specifically ensure the flagged sections are completely restructured."
        
        # Async generation with GenerationConfig
        response = await model.generate_content_async(
            combined_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                # Removed max_output_tokens to allow full-length rewritten documents
            )
        )
        
        return {
            "humanizedText": response.text,
            "usedMock": False
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
