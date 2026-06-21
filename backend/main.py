from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import upload, chat, documents, health

from contextlib import asynccontextmanager
from mcp_ext.client import mcp_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing MCP Client Manager...")
    await mcp_manager.init_all()
    yield
    print("Closing MCP Client Manager...")
    await mcp_manager.close()

app = FastAPI(
    title="MCP Documentation Assistant",
    description="Production-Ready AI Assistant with MCP tool access.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
