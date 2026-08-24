from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv(Path(__file__).resolve().parent / ".env")

# Memory and CPU optimizations for cloud container environments
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

_embedding_model = None

def get_embedding_model():
    """
    Lazy-loads the embedding model on first use so server boots instantly.
    """
    global _embedding_model
    if _embedding_model is None:
        try:
            import torch
            torch.set_num_threads(1)
        except Exception:
            pass
        from langchain_huggingface import HuggingFaceEmbeddings
        _embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True, "batch_size": 8}
        )
    return _embedding_model

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
    model = get_embedding_model()
    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=model
    )
    os.makedirs("vector_db", exist_ok=True)
    vector_store.save_local("vector_db")
    return vector_store

# Pre-warm embedding model in background thread so first upload is instant
import threading

def _warmup_worker():
    try:
        get_embedding_model()
        print("Embedding model successfully loaded in background.")
    except Exception as e:
        print(f"Embedding warmup error: {e}")

threading.Thread(target=_warmup_worker, daemon=True).start()
