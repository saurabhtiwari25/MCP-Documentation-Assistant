import os
import uuid

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from langchain_google_genai import GoogleGenerativeAIEmbeddings

EMBEDDING_MODEL = "models/gemini-embedding-001"
COLLECTION_NAME = "documents_gemini_3072"


class VectorStore:
    def __init__(self):
        print("1. Starting VectorStore")
        print("2. QDRANT_URL =", os.environ.get("QDRANT_URL"))

        self.client = QdrantClient(
            url=os.environ["QDRANT_URL"],
            api_key=os.environ["QDRANT_API_KEY"],
            timeout=30,
        )

        print("3. QdrantClient created")

        self.encoder = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL,
            google_api_key=os.getenv("GEMINI_API_KEY")
        )

        print("4. Encoder created")

        self._ensure_collection()

        print("5. Collection ensured")

    def _ensure_collection(self):
        collections = self.client.get_collections().collections

        if not any(c.name == COLLECTION_NAME for c in collections):
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=3072,
                    distance=Distance.COSINE
                ),
            )

    def add_documents(self, chunks: list[str], metadata: list[dict]):
        if not chunks:
            return

        vectors = self.encoder.embed_documents(chunks)

        points = []

        for i, (chunk, meta) in enumerate(zip(chunks, metadata)):
            point_id = str(uuid.uuid4())

            meta["content"] = chunk

            points.append(
                PointStruct(
                    id=point_id,
                    vector=vectors[i],
                    payload=meta
                )
            )

        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )

    def search(self, query: str, limit: int = 5) -> list[dict]:
        vector = self.encoder.embed_query(query)

        search_result = self.client.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=limit,
            with_payload=True
        )

        results = []

        for hit in search_result.points:
            results.append(
                {
                    "score": hit.score,
                    "content": hit.payload.get("content", ""),
                    "source": hit.payload.get("source", "unknown"),
                }
            )

        return results


store = VectorStore()