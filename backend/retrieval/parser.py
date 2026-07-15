import os
from vectorstore.qdrant_store import store


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Simple chunking function that splits text into chunks of approximately
    `chunk_size` characters while preserving paragraph boundaries when possible.
    
    Strategy:
      1. Split the text into paragraphs (double newlines).
      2. Greedily merge paragraphs into chunks up to `chunk_size`.
      3. If a single paragraph exceeds `chunk_size`, split it by sentences/words.
      4. Apply overlap between consecutive chunks for context continuity.
    """
    if not text or not text.strip():
        return []

    # Split into paragraphs
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks: list[str] = []
    current_chunk = ""

    for para in paragraphs:
        # If adding this paragraph fits within the chunk size, merge it
        if len(current_chunk) + len(para) + 2 <= chunk_size:
            current_chunk = f"{current_chunk}\n\n{para}".strip()
        else:
            # Save the current chunk if it has content
            if current_chunk:
                chunks.append(current_chunk)

            # If the paragraph itself is too long, split it further
            if len(para) > chunk_size:
                words = para.split()
                sub_chunk = ""
                for word in words:
                    if len(sub_chunk) + len(word) + 1 <= chunk_size:
                        sub_chunk = f"{sub_chunk} {word}".strip()
                    else:
                        if sub_chunk:
                            chunks.append(sub_chunk)
                        sub_chunk = word
                current_chunk = sub_chunk  # Carry the remainder forward
            else:
                current_chunk = para

    # Don't forget the last chunk
    if current_chunk:
        chunks.append(current_chunk)

    # Apply overlap: prepend the last `chunk_overlap` characters of the
    # previous chunk to the beginning of the next chunk
    if chunk_overlap > 0 and len(chunks) > 1:
        overlapped_chunks = [chunks[0]]
        for i in range(1, len(chunks)):
            prev = chunks[i - 1]
            overlap_text = prev[-chunk_overlap:]
            overlapped_chunks.append(f"{overlap_text}...{chunks[i]}")
        chunks = overlapped_chunks

    return chunks


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
        try:
            from unstructured.partition.auto import partition
            elements = partition(filename=file_path)
            text = "\n\n".join([str(e) for e in elements])
        except Exception:
            raise ValueError(f"Unsupported file format and unstructured failed: {ext}")
            
    if not text.strip():
        raise ValueError("No text could be extracted from the file.")
    
    # Use simple paragraph-aware chunking instead of RecursiveCharacterTextSplitter
    chunks = chunk_text(text, chunk_size=1000, chunk_overlap=200)
    
    metadata = [{"source": filename, "chunk_index": i} for i in range(len(chunks))]
    store.add_documents(chunks, metadata)
    
    return len(chunks)
