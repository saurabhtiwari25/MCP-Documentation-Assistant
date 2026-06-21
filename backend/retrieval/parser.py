import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from vectorstore.qdrant_store import store

def process_and_store_document(file_path: str, filename: str):
    """Parse file, chunk, and store in Qdrant."""
    ext = os.path.splitext(filename)[1].lower()
    text = ""
    
    if ext == ".pdf":
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    elif ext in [".txt", ".md"]:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        # Fallback to unstructured if installed
        try:
            from unstructured.partition.auto import partition
            elements = partition(filename=file_path)
            text = "\n\n".join([str(e) for e in elements])
        except Exception:
            raise ValueError(f"Unsupported file format and unstructured failed: {ext}")
            
    if not text.strip():
        raise ValueError("No text could be extracted from the file.")
        
    # Chunking
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_text(text)
    
    # Store
    metadata = [{"source": filename, "chunk_index": i} for i in range(len(chunks))]
    store.add_documents(chunks, metadata)
    
    return len(chunks)
