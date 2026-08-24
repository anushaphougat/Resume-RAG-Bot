from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from utils import format_llm_response
import os

load_dotenv()

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY")
)
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

retriever = None


def init_retriever():
    global retriever
    if os.path.exists("vector_db"):
        vector_store = FAISS.load_local(
            "vector_db",
            embedding_model,
            allow_dangerous_deserialization=True
        )
        retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    else:
        retriever = None


def reload_retriever():
    init_retriever()


init_retriever()


def retrieve_resume(query):
    if retriever is None:
        return []
    return retriever.invoke(query)


def ask_resume(query):
    if retriever is None:
        return "No resume indexed yet. Please upload a resume first."

    documents = retriever.invoke(query)
    context = "\n\n".join(doc.page_content for doc in documents)

    prompt = f"""
    You are a helpful resume assistant.

    Use ONLY the information from the resume below to answer the question.

    Resume:
    {context}

    Question:
    {query}
    """

    response = llm.invoke(prompt)
    return format_llm_response(response.content)
