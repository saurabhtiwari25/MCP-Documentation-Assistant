import os
import json
from pydantic import BaseModel, Field
from langchain_core.tools import tool, StructuredTool
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, SystemMessage

from mcp_ext.client import mcp_manager
from vectorstore.qdrant_store import store as vector_store

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


def retrieve_context(query: str, limit: int = 5) -> tuple[list[dict], str]:
    """
    RAG Retrieval Step: Search Qdrant for relevant document chunks.
    Returns (raw_results, formatted_context_string).
    """
    try:
        results = vector_store.search(query, limit=limit)
        if not results:
            return [], ""

        context_parts = []
        for i, res in enumerate(results):
            source = res.get("source", "unknown")
            content = res.get("content", "")
            score = res.get("score", 0)
            context_parts.append(
                f"[Document {i+1}] (Source: {source}, Relevance: {score:.4f})\n{content}"
            )

        formatted_context = "\n\n---\n\n".join(context_parts)
        return results, formatted_context
    except Exception as e:
        print(f"Error during RAG retrieval: {e}")
        return [], ""


def build_system_prompt(context: str) -> str:
    """Build system prompt with retrieved document context injected."""
    base_prompt = (
        "You are a highly capable Documentation Assistant. "
        "Your primary job is to answer questions based on the user's uploaded documents.\n\n"
    )

    if context:
        base_prompt += (
            "## Retrieved Document Context\n"
            "The following are the most relevant excerpts retrieved from the user's uploaded documents. "
            "You MUST use this context as your PRIMARY source of information when answering. "
            "Always cite the source document name when referencing information from the context.\n\n"
            f"{context}\n\n"
            "## Instructions\n"
            "1. Answer the user's question based on the document context above.\n"
            "2. If the context contains the answer, use it directly and cite the source.\n"
            "3. If the context is partially relevant, use what you can and note any gaps.\n"
            "4. Only use your MCP tools if the context above does not contain enough information.\n"
            "5. If you truly cannot find the answer in the context or via tools, say so honestly.\n"
            "6. Always mention which document(s) your answer is based on.\n"
        )
    else:
        base_prompt += (
            "No documents were found in the knowledge base for this query. "
            "You have access to MCP tools to search and read local documents, PDFs, and vector stores. "
            "Try using them to find relevant information. "
            "If no documents are available, let the user know they should upload documents first.\n"
        )

    return base_prompt


async def stream_question(query: str):
    results, context = retrieve_context(query, limit=5)

    sources_found = list(set(r.get("source", "unknown") for r in results))
    yield {
        "type": "retrieval",
        "sources": sources_found,
        "count": len(results),
    }

    llm = ChatGroq(
        model="llama-3.3-70b-versatile", 
        temperature=0.2,
        streaming=True
    )
    
    system_prompt = build_system_prompt(context)

    raw_mcp_tools = await mcp_manager.get_all_tools()
    tools = create_mcp_langchain_tools(raw_mcp_tools)
    
    agent = create_react_agent(llm, tools, prompt=system_prompt)
    
    final_output = ""
    async for event in agent.astream_events(
        {"messages": [HumanMessage(content=query)]},
        version="v2"
    ):
        kind = event["event"]
        
        if kind == "on_tool_start":
            yield {"type": "tool_call", "content": f"Using {event['name']}..."}
            
        elif kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content and not getattr(chunk, 'tool_call_chunks', []):
                text = chunk.content if isinstance(chunk.content, str) else "".join(
                    part.get("text", "") if isinstance(part, dict) else str(part)
                    for part in chunk.content
                )
                if text:
                    yield {"type": "token", "content": text}
                    final_output += text
    
    struct_llm = llm.with_structured_output(QAResponse)
    try:
        structured_res = await struct_llm.ainvoke(f"Based on this answer: {final_output}\nExtract the final answer, sources used, and a confidence score. If no sources, return empty list.")
        yield {"type": "citations", "sources": structured_res.sources, "confidence": structured_res.confidence}
    except Exception as e:
        print("Error extracting structured response:", e)
