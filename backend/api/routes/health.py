from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    return {"status": "healthy", "mcp": "ok", "qdrant": "ok", "postgres": "ok"}
