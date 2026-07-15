from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def split_text(text):
    """
    Splits the resume text into smaller chunks using RecursiveCharacterTextSplitter.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
    )

    chunks = text_splitter.create_documents([text])
    return chunks

def create_vector_store(chunks):
    vector_store = FAISS.from_documents(documents=chunks, embedding=embedding_model)
    os.makedirs("vector_db", exist_ok=True)
    vector_store.save_local("vector_db")
    return vector_store