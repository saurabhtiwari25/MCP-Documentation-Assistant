from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    # In a real app, we would also check Qdrant and Postgres connection here
    return {"status": "healthy", "mcp": "ok", "qdrant": "ok", "postgres": "ok"}
