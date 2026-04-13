from fastapi import HTTPException
from app.dependencies import AuthDep
from app.schemas.chat import ChatRequest
from app.config import get_settings
from . import api_router

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

SYSTEM_PROMPT = """You are an AI fitness coach built into the Workout Remixer app.
You help users with exercise form, technique tips, workout advice, nutrition guidance and motivation.
Keep responses concise (under 120 words) unless detailed technique is requested.
Be encouraging, specific, and always prioritise safety."""


@api_router.post("/chat")
async def chat(request: ChatRequest, user: AuthDep):
    try:
        llm = ChatGroq(
            api_key=get_settings().groq_api_key,
            model="llama-3.3-70b-versatile",
            max_tokens=300,
            temperature=0.7,
        )

        # bascially feeding LangChain the logs
        messages = [SystemMessage(content=SYSTEM_PROMPT)]

        if request.exercise_context:
            messages.append(SystemMessage(content=f"Current workout context:\n{request.exercise_context}"))

        for m in request.messages:
            if m.role == "user":
                messages.append(HumanMessage(content=m.content))
            else:
                messages.append(AIMessage(content=m.content))

        
        response = llm.invoke(messages)
        return {"reply": response.content}

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
    
    #we just added this one do a render test to make sure its working it took a quite a while

    #the rest of them should be good so dont worry too much about them