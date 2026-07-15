from fastapi import APIRouter
from mcp_ext.client import mcp_manager

router = APIRouter()

@router.get("/")
async def health_check():
    return {
        "status": "healthy", 
        "mcp": "ok", 
        "qdrant": "ok",
        "mcp_servers": list(mcp_manager.sessions.keys())
    }
