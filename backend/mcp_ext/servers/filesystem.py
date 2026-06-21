import asyncio
import os
import glob
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("filesystem")

@mcp.tool()
async def read_file(filepath: str) -> str:
    """Read the contents of a local file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

@mcp.tool()
async def list_directory(directory: str) -> list[str]:
    """List contents of a directory."""
    try:
        return os.listdir(directory)
    except Exception as e:
        return [f"Error listing directory: {str(e)}"]

@mcp.tool()
async def search_files(directory: str, pattern: str) -> list[str]:
    """Search for files matching a pattern in a directory (e.g. '*.md')."""
    try:
        search_path = os.path.join(directory, "**", pattern)
        return glob.glob(search_path, recursive=True)
    except Exception as e:
        return [f"Error searching files: {str(e)}"]

if __name__ == "__main__":
    mcp.run()
