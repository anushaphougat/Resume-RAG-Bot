from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv(Path(__file__).resolve().parent / ".env")

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def split_text(text):
    if not text or not text.strip():
        return []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
    )
    return text_splitter.create_documents([text])

def create_vector_store(chunks):
    if not chunks:
        raise ValueError("Cannot create vector store with empty chunks.")
    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embedding_model
    )
    os.makedirs("vector_db", exist_ok=True)
    vector_store.save_local("vector_db")
    return vector_store
