import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents.qa_agent import ask_question

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_endpoint(request: ChatRequest):

    
    async def generate():
        try:
            response = await ask_question(request.message)
            
            yield f"data: {json.dumps({'type': 'status', 'content': 'Tools executed successfully'})}\n\n"
            
            words = response.answer.split(" ")
            for word in words:
                yield f"data: {json.dumps({'type': 'token', 'content': word + ' '})}\n\n"
                
            yield f"data: {json.dumps({'type': 'citations', 'sources': response.sources, 'confidence': response.confidence})}\n\n"
            
            yield f"data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
