from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_text_from_pdf
from embeddings import split_text, create_vector_store
from rag import ask_resume, reload_retriever
from ats import analyze_resume_ats
from pydantic import BaseModel
from utils import ensure_directory
import shutil
import os

class QuestionRequest(BaseModel):
    question: str

class AtsRequest(BaseModel):
    filename: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
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
    file_path = f"resumes/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Resume '{filename}' not found. Upload it first via /upload_resume/.")
    return extract_text_from_pdf(file_path)

@app.get("/")
def home():
    return {"message": "Welcome to the Resume Upload API"}  

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...)):
    file_path = f"resumes/{file.filename}"
    with open(file_path, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Extract text from the uploaded resume
    resume_text = extract_text_from_pdf(file_path)
    chunks = split_text(resume_text)
    create_vector_store(chunks)
    reload_retriever()
    return {"message": "Resume uploaded successfully", "filename": file.filename, "total_chunks": len(chunks),"first_chunk": chunks[0].page_content }

@app.post("/ask-question/")
async def ask_question(request: QuestionRequest):
    answer = ask_resume(request.question)

    print("Question:", request.question)
    print("Answer:", answer)

    return {
        "question": request.question,
        "answer": answer
    }

@app.post("/analyze-ats/")
async def analyze_ats(request: AtsRequest):
    """
    Runs an ATS-style review on a resume that has already been uploaded.
    """
    resume_text = get_resume_text_or_404(request.filename)
    result = analyze_resume_ats(resume_text)

    return {
        "filename": request.filename,
        "ats_review": result
    }

