from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_text_from_pdf
from embeddings import split_text, create_vector_store
from rag import ask_resume, reload_retriever, set_retriever_from_vector_store
from ats import analyze_resume_ats
from pydantic import BaseModel
from utils import ensure_directory, validate_pdf
import shutil
import os

class QuestionRequest(BaseModel):
    question: str

class AtsRequest(BaseModel):
    filename: str

app = FastAPI(title="Resume RAG Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the resumes directory if it doesn't exist
ensure_directory("resumes")

def get_resume_text_or_404(filename: str) -> str:
    """
    Looks up an already-uploaded resume by filename and extracts its text.
    Raises a 404 if the file was never uploaded.
    """
    file_path = os.path.join("resumes", filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"Resume '{filename}' not found. Upload it first via /upload_resume/."
        )
    text = extract_text_from_pdf(file_path)
    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract text from '{filename}'. Please make sure the PDF contains selectable text."
        )
    return text

@app.get("/")
def home():
    return {"message": "Welcome to the Resume Upload API"}  

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename or not validate_pdf(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are supported.")

    file_path = os.path.join("resumes", file.filename)
    with open(file_path, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from the uploaded resume
    resume_text = extract_text_from_pdf(file_path)
    if not resume_text or not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="The uploaded PDF contains no extractable text. Please ensure it is not a scanned image-only PDF."
        )

    chunks = split_text(resume_text)
    if not chunks:
        raise HTTPException(status_code=400, detail="Failed to parse resume into chunks.")

    vector_store = create_vector_store(chunks)
    set_retriever_from_vector_store(vector_store)

    return {
        "message": "Resume uploaded successfully",
        "filename": file.filename,
        "total_chunks": len(chunks),
        "first_chunk": chunks[0].page_content if chunks else ""
    }

@app.post("/ask-question/")
async def ask_question(request: QuestionRequest):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    answer = ask_resume(request.question)
    return {
        "question": request.question,
        "answer": answer
    }

@app.post("/analyze-ats/")
async def analyze_ats(request: AtsRequest):
    """
    Runs an ATS-style review on a resume that has already been uploaded.
    """
    if not request.filename or not request.filename.strip():
        raise HTTPException(status_code=400, detail="Filename cannot be empty.")

    resume_text = get_resume_text_or_404(request.filename)
    result = analyze_resume_ats(resume_text)

    return {
        "filename": request.filename,
        "ats_review": result
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


