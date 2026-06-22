import os
import sys
from contextlib import AsyncExitStack
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPClientManager:
    def __init__(self):
        self.exit_stack = AsyncExitStack()
        self.sessions: dict[str, ClientSession] = {}

    async def connect_server(self, name: str, script_path: str):
        """Connect to an MCP server via stdio."""
        server_params = StdioServerParameters(
            command=sys.executable,
            args=[script_path]
        )
        
        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        read, write = stdio_transport
        
        session = await self.exit_stack.enter_async_context(ClientSession(read, write))
        await session.initialize()
        
        self.sessions[name] = session
        print(f"Connected to MCP Server: {name}")

    async def init_all(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        servers_dir = os.path.join(base_dir, "servers")
        
        await self.connect_server("filesystem", os.path.join(servers_dir, "filesystem.py"))
        await self.connect_server("pdf", os.path.join(servers_dir, "pdf.py"))
        await self.connect_server("documentation", os.path.join(servers_dir, "documentation.py"))

    async def get_all_tools(self):
        """Aggregate tools from all connected servers."""
        all_tools = []
        for name, session in self.sessions.items():
            response = await session.list_tools()
            for tool in response.tools:
                all_tools.append({
                    "server": name,
                    "tool": tool,
                    "session": session
                })
        return all_tools

    async def call_tool(self, server_name: str, tool_name: str, arguments: dict):
        """Execute a tool on a specific server."""
        if server_name not in self.sessions:
            raise ValueError(f"Server {server_name} not found")
        
        session = self.sessions[server_name]
        result = await session.call_tool(tool_name, arguments)
        return result

    async def close(self):
        await self.exit_stack.aclose()

mcp_manager = MCPClientManager()
