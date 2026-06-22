import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("documentation")

@mcp.tool()
async def search_document(query: str, limit: int = 3) -> str:
    """Semantic search across all uploaded documentation."""
    try:
        from vectorstore.qdrant_store import store
        results = store.search(query, limit=limit)
        if not results:
            return "No documents found matching your query."
        
        formatted_results = []
        for i, res in enumerate(results):
            score = round(res['score'], 4)
            formatted_results.append(
                f"[Result {i+1}] (Score: {score}, Source: {res['source']})\n{res['content']}\n"
            )
        return "\n".join(formatted_results)
    except Exception as e:
        return f"Error searching documents: {str(e)}"

@mcp.tool()
async def list_documents() -> list[str]:
    """List the unique sources/files uploaded to the vector store."""
    try:
        from vectorstore.qdrant_store import store
        results = store.search("", limit=100)
        sources = list(set(r['source'] for r in results if 'source' in r))
        return sources
    except Exception as e:
        return [f"Error listing documents: {str(e)}"]

if __name__ == "__main__":
    mcp.run()
