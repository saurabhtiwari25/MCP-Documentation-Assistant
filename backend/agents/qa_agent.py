import os
import json
from pydantic import BaseModel, Field
from langchain_core.tools import tool, StructuredTool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langchain_core.prompts import ChatPromptTemplate

from mcp_ext.client import mcp_manager

class QAResponse(BaseModel):
    answer: str = Field(description="The detailed answer to the user's question.")
    sources: list[str] = Field(description="List of document names or file paths used to answer.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0.")

def create_mcp_langchain_tools(mcp_tools: list[dict]):
    """Convert MCP tools to LangChain tools."""
    lc_tools = []
    
    for item in mcp_tools:
        server_name = item["server"]
        mcp_tool = item["tool"]
        
        def make_tool_func(s_name, t_name):
            async def func(**kwargs):
                # We log the tool call for the frontend UI (this would typically be emitted via WebSockets or a shared DB)
                print(f"MCP_TOOL_CALL: {s_name}.{t_name} with {kwargs}")
                
                result = await mcp_manager.call_tool(s_name, t_name, kwargs)
                
                if result.isError:
                    return f"Error: {result.content}"
                
                texts = [c.text for c in result.content if getattr(c, 'type', '') == 'text']
                return "\n".join(texts)
            return func
            

        lc_tool = StructuredTool.from_function(
            func=None,
            coroutine=make_tool_func(server_name, mcp_tool.name),
            name=f"{server_name}_{mcp_tool.name}",
            description=mcp_tool.description or f"Tool {mcp_tool.name} from {server_name}",
        )
        lc_tools.append(lc_tool)
        
    return lc_tools

async def ask_question(query: str):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro", 
        temperature=0.2,
    )
    
    # Get tools from MCP
    raw_mcp_tools = await mcp_manager.get_all_tools()
    tools = create_mcp_langchain_tools(raw_mcp_tools)
    
    system_prompt = "You are a highly capable Documentation Assistant. You have access to MCP tools to search and read local documents, PDFs, and vector stores. Use them to gather information before answering. Provide accurate answers with citations."
    
    agent_executor = create_react_agent(llm, tools, state_modifier=system_prompt)
    
    # Run the agent
    response = await agent_executor.ainvoke({"messages": [("user", query)]})
    
    final_output = response["messages"][-1].content
    
    struct_llm = llm.with_structured_output(QAResponse)
    structured_res = await struct_llm.ainvoke(f"Based on this answer: {final_output}\nExtract the final answer, sources used, and a confidence score.")
    
    return structured_res
