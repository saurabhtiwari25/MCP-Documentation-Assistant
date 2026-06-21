# Production-Ready MCP Documentation Assistant

An enterprise-ready AI Documentation Assistant that uses the **Model Context Protocol (MCP)** for secure, standardized tool access and document retrieval. This project leverages an advanced **Agentic RAG (Retrieval-Augmented Generation)** architecture to dynamically extract information from local files, PDFs, and vector databases using a Gemini-powered LangChain Agent.

By decoupling tool logic into independent MCP Servers, this architecture is highly scalable and mirrors modern enterprise AI deployment patterns.

---

## ✨ Key Features

- **Multi-format Document Processing**: Upload Markdown (`.md`), Text (`.txt`), and PDF (`.pdf`) files directly from the UI.
- **Agentic RAG Architecture**: Automatically chunks and embeds uploaded documents into Qdrant for semantic search. The Agent independently decides *when* and *how* to search based on the user's query.
- **MCP Tool Calling**: The LangChain Agent dynamically queries three internal MCP stdio servers to read files, search the vector DB, and process PDFs.
- **Conversational QA with SSE Streaming**: Get real-time, token-by-token answers streamed to the UI with detailed source citations and confidence scores.
- **Live MCP Activity Panel**: Visualizes the AI Agent's thought process and tool execution in real-time, making agentic actions transparent.
- **Clean UI**: Built with pure React 19 and vanilla CSS (No Tailwind/MUI) to demonstrate fundamental frontend proficiency.
- **Dockerized**: Fully containerized with Docker Compose for seamless, single-command deployment.

---

## 🚀 Technologies Used

### Backend & AI Infrastructure
- **Python 3.12+**
- **FastAPI & Pydantic v2**: High-performance REST APIs with strict data validation.
- **LangChain**: For core orchestration, memory, and the `create_tool_calling_agent`.
- **Google Gemini API**: Core Reasoning LLM via `langchain-google-genai`.
- **Model Context Protocol (MCP)**: Standardized tool interface using `mcp.client.stdio` and `FastMCP`.
- **Qdrant**: High-performance local vector database running in Docker.
- **Sentence-Transformers**: Uses the **`all-MiniLM-L6-v2`** model to generate vector embeddings. This model runs entirely locally (no API costs), is extremely fast, and produces 384-dimensional embeddings that are highly optimized for semantic search.
- **PyPDF & Unstructured**: Advanced document ingestion and parsing.

### Frontend
- **React 19 & Vite**: Modern, lightning-fast frontend stack.
- **Vanilla CSS**: Custom global theme using CSS variables, flexbox, and grid layouts.
- **React Router**: Client-side routing for SPA navigation.
- **Lucide React**: Beautiful, lightweight SVG icons.

---

## 🧠 System Architecture & Workflow

1. **Ingestion Flow**: 
   - User uploads a file via the React UI (`/documents`).
   - FastAPI receives the `multipart/form-data`.
   - `parser.py` detects the extension, extracts text, and chunks it using `RecursiveCharacterTextSplitter`.
   - Chunks are vectorized via `SentenceTransformer` and stored in `Qdrant` with metadata.
2. **Query Flow**:
   - User asks a question in the Chat UI.
   - FastAPI initializes the LangChain Agent.
   - The Agent analyzes the query and decides which MCP server tool to call (e.g., `search_document` or `read_pdf`).
   - The backend `MCPClientManager` pipes the JSON-RPC request to the respective Python `stdio` server.
   - The tool executes (e.g., querying Qdrant), returns the context to the Agent.
   - The Agent synthesizes the final answer and streams it back to the frontend via Server-Sent Events (SSE).

---

## 🛠️ MCP Servers & Available Tools

This project implements three distinct MCP servers, running as isolated `stdio` subprocesses:

1. **Filesystem MCP Server (`filesystem.py`)**
   - `read_file(filepath)`: Reads the raw text of any local file.
   - `list_directory(directory)`: Lists all files in a given folder.
   - `search_files(directory, pattern)`: Glob pattern matching (e.g., `*.md`).

2. **Documentation MCP Server (`documentation.py`)**
   - `search_document(query, limit)`: Performs a semantic cosine-similarity search against the Qdrant vector database.
   - `list_documents()`: Returns a unique list of all indexed document sources.

3. **PDF MCP Server (`pdf.py`)**
   - `read_pdf(filepath)`: Extracts raw text page-by-page from a PDF.
   - `search_pdf(filepath, query)`: Keyword-based context window extraction within a specific PDF.

---

## 📂 Detailed Project Structure

```text
├── docker-compose.yml       # Orchestrates FastAPI, React, Qdrant, and PostgreSQL
├── backend/
│   ├── Dockerfile           # Python 3.12 environment setup
│   ├── requirements.txt     # Backend dependencies
│   ├── main.py              # FastAPI entry point & MCP Lifespan manager
│   ├── agents/
│   │   └── qa_agent.py      # LangChain tool-calling Agent & Gemini prompt design
│   ├── api/routes/          
│   │   ├── chat.py          # POST /chat (SSE Streaming)
│   │   ├── upload.py        # POST /upload (File processing)
│   │   ├── documents.py     # GET/DELETE local files
│   │   └── health.py        # GET /health
│   ├── mcp/
│   │   ├── client.py        # MCPClientManager handling stdio subprocesses
│   │   └── servers/         # The isolated MCP stdio servers
│   │       ├── filesystem.py 
│   │       ├── pdf.py        
│   │       └── documentation.py 
│   ├── retrieval/
│   │   └── parser.py        # Document text extraction and chunking logic
│   └── vectorstore/
│       └── qdrant_store.py  # Qdrant client wrapper & Embedding model initialization
└── frontend/
    ├── Dockerfile           # Node 20 environment setup
    ├── package.json         # React 19 dependencies
    └── src/
        ├── index.css        # Global CSS variables and core layout styling
        ├── App.jsx          # React Router configuration
        ├── components/      # Reusable UI (Navbar, Sidebar, MCPStatus panel)
        └── pages/           # Main views (Dashboard, Chat, Documents, Settings)
```

---

## 🔌 API Endpoints Reference

- **`GET /health`**: Returns system status for FastAPI, MCP, and Qdrant.
- **`POST /upload`**: Accepts `multipart/form-data` for document ingestion.
- **`POST /chat`**: Accepts `{ "message": "query" }` and returns a text/event-stream.
- **`GET /documents`**: Returns a JSON list of successfully uploaded files.
- **`DELETE /documents/{filename}`**: Removes a file from the server.

---

## 🚀 How to Run

### Prerequisites
1. Ensure you have **Docker** and **Docker Compose** installed on your machine.
2. Obtain a **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

### Step-by-Step Instructions

1. **Set Environment Variable:**
   Open your terminal/command prompt and set your Gemini API key as an environment variable so Docker Compose can inject it securely into the backend container.
   
   *Windows (PowerShell):*
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"
   ```
   *macOS/Linux:*
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

2. **Build and Start Containers:**
   Navigate to the project root directory (where `docker-compose.yml` is located) and run:
   ```bash
   docker-compose up --build
   ```
   *Note: This will download the Qdrant, PostgreSQL, Python, and Node images, install dependencies, and start all services. The first boot may take a few minutes as the backend downloads the `all-MiniLM-L6-v2` embedding model.*

3. **Access the Application:**
   Once the console shows that Vite and FastAPI are running:
   - Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

4. **Usage Guide:**
   - **Upload Documents:** Go to the "Documents" tab and upload a sample `.txt` or `.pdf` file. Wait for the upload and chunking to complete.
   - **Ask Questions:** Navigate to the "Chat" tab and ask a specific question about the uploaded document. Watch the **MCP Activity Panel** on the right side to see the Agent dynamically triggering `documentation.py` or `pdf.py` tools in the background before streaming your answer!

### Troubleshooting
- **API Key Error:** If the backend fails to respond to chat queries, ensure `$env:GEMINI_API_KEY` was correctly passed to Docker and the terminal session hasn't restarted.
- **Port Conflicts:** Ensure ports `8000` (FastAPI), `5173` (Vite), `6333` (Qdrant), and `5432` (PostgreSQL) are not currently being used by other applications (like local Postgres installations) on your system.
- **Embeddings Download:** On the very first upload, the system must download the Sentence-Transformer model. If the upload hangs, check the docker logs (`docker-compose logs backend`) to monitor the download progress.
