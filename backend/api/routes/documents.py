import os
from fastapi import APIRouter

router = APIRouter()

UPLOAD_DIR = "uploaded_files"

@router.get("/")
async def get_documents():
    """List all uploaded local files."""
    try:
        if not os.path.exists(UPLOAD_DIR):
            return {"documents": []}
        
        files = os.listdir(UPLOAD_DIR)
        
        docs = []
        for f in files:
            file_path = os.path.join(UPLOAD_DIR, f)
            size = os.path.getsize(file_path)
            docs.append({
                "filename": f,
                "size": size
            })
            
        return {"documents": docs}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/{filename}")
async def delete_document(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": "Deleted successfully"}
    return {"message": "File not found"}
