import os
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import uuid


EMBEDDING_MODEL = "models/embedding-001"
COLLECTION_NAME = "documents_gemini"

class VectorStore:
    def __init__(self):
        qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        self.client = QdrantClient(host=qdrant_host, port=6333)
        self.encoder = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL,
            google_api_key=os.getenv("GEMINI_API_KEY")
        )
        self._ensure_collection()
        
    def _ensure_collection(self):
        collections = self.client.get_collections().collections
        if not any(c.name == COLLECTION_NAME for c in collections):
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE),
            )
            
    def add_documents(self, chunks: list[str], metadata: list[dict]):
        if not chunks: return
        
        vectors = self.encoder.embed_documents(chunks)
        
        points = []
        for i, (chunk, meta) in enumerate(zip(chunks, metadata)):
            point_id = str(uuid.uuid4())
            meta['content'] = chunk
            points.append(
                PointStruct(id=point_id, vector=vectors[i], payload=meta)
            )
            
        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        
    def search(self, query: str, limit: int = 5) -> list[dict]:
        vector = self.encoder.embed_query(query)
        search_result = self.client.search(
            collection_name=COLLECTION_NAME,
            query_vector=vector,
            limit=limit
        )
        
        results = []
        for hit in search_result:
            results.append({
                "score": hit.score,
                "content": hit.payload.get("content", ""),
                "source": hit.payload.get("source", "unknown"),
            })
        return results

store = VectorStore()
