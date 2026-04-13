from fastapi import HTTPException
from app.dependencies import AuthDep
from app.schemas.chat import ChatRequest
from app.config import get_settings
from . import api_router
import httpx

SYSTEM_PROMPT = """You are an AI fitness coach built into the Workout Remixer app.
You help users with exercise form, technique tips, workout advice, nutrition guidance and motivation.
Keep responses concise (under 120 words) unless detailed technique is requested.
Be encouraging, specific, and always prioritise safety."""


@api_router.post("/chat")
async def chat(request: ChatRequest, user: AuthDep):
    api_key = get_settings().groq_api_key

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if request.exercise_context:
        messages.append({
            "role": "system",
            "content": f"Current workout context:\n{request.exercise_context}"
        })

    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "max_tokens": 300,
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            return {"reply": reply}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service timed out")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")