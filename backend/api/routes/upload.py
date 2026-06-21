import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from retrieval.parser import process_and_store_document

router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse and store in Qdrant
        num_chunks = process_and_store_document(file_path, file.filename)
        
        return {
            "message": "File uploaded and indexed successfully",
            "filename": file.filename,
            "chunks": num_chunks
        }
    except Exception as e:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))
