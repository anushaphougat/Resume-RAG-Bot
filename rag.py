from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from pathlib import Path
from utils import format_llm_response
from prompts import RESUME_QA_PROMPT
from embeddings import get_embedding_model
import os

load_dotenv(Path(__file__).resolve().parent / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

llm = ChatGroq(
    model=GROQ_MODEL,
    groq_api_key=GROQ_API_KEY
)

retriever = None


def init_retriever():
    global retriever
    if os.path.exists("vector_db"):
        try:
            model = get_embedding_model()
            vector_store = FAISS.load_local(
                "vector_db",
                model,
                allow_dangerous_deserialization=True
            )
            retriever = vector_store.as_retriever(search_kwargs={"k": 3})
        except Exception as e:
            print(f"Warning: Failed to load vector store: {e}")
            retriever = None
    else:
        retriever = None


def reload_retriever():
    init_retriever()


def set_retriever_from_vector_store(vector_store):
    global retriever
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})


def retrieve_resume(query):
    if retriever is None:
        return []
    return retriever.invoke(query)


def ask_resume(query):
    if retriever is None:
        return "No resume indexed yet. Please upload a resume first."

    documents = retriever.invoke(query)
    if not documents:
        return "The resume does not mention this information."

    context = "\n\n".join(doc.page_content for doc in documents)
    prompt = RESUME_QA_PROMPT.format(context=context, question=query)

    response = llm.invoke(prompt)
    return format_llm_response(response.content)
