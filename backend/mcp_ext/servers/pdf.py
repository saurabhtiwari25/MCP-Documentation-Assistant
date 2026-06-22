import asyncio
from mcp.server.fastmcp import FastMCP
import os

mcp = FastMCP("pdf")

@mcp.tool()
async def read_pdf(filepath: str) -> str:
    """Extract text from a PDF file."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except ImportError:
        return "Error: pypdf not installed."
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

@mcp.tool()
async def search_pdf(filepath: str, query: str) -> str:
    """Search for a specific query within a PDF file and return surrounding context."""
    text = await read_pdf(filepath)
    if "Error" in text:
        return text
    
    lines = text.split('\n')
    results = []
    for i, line in enumerate(lines):
        if query.lower() in line.lower():
            start = max(0, i - 2)
            end = min(len(lines), i + 3)
            context = "\n".join(lines[start:end])
            results.append(f"--- Match found ---\n{context}")
    
    if not results:
        return "No matches found."
    return "\n\n".join(results[:5]) 

if __name__ == "__main__":
    mcp.run()
