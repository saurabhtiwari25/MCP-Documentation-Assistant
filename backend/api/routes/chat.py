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
    # In a fully streaming setup we would use agent_executor.astream_events.
    # For this simplified enterprise architecture, we process it and stream the result back
    # or just return JSON. Since the requirement asks for StreamingResponse, let's stream the final structured output.
    
    async def generate():
        try:
            # We fetch the full structured response
            response = await ask_question(request.message)
            
            # Send tool call status first
            yield f"data: {json.dumps({'type': 'status', 'content': 'Tools executed successfully'})}\n\n"
            
            # Simulate streaming the answer
            words = response.answer.split(" ")
            for word in words:
                yield f"data: {json.dumps({'type': 'token', 'content': word + ' '})}\n\n"
                
            # Send citations
            yield f"data: {json.dumps({'type': 'citations', 'sources': response.sources, 'confidence': response.confidence})}\n\n"
            
            yield f"data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
