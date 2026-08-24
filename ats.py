from langchain_groq import ChatGroq
from dotenv import load_dotenv
from pathlib import Path
from prompts import ATS_PROMPT
from utils import format_llm_response
import os

load_dotenv(Path(__file__).resolve().parent / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

llm = ChatGroq(
    model=GROQ_MODEL,
    groq_api_key=GROQ_API_KEY
)


def analyze_resume_ats(resume_text):
    """
    Runs a standalone ATS-style review of a resume.
    Returns: ATS score, summary, strengths, weaknesses,
    missing keywords, and improvement suggestions.
    """
    if not resume_text or not resume_text.strip():
        return "Resume content is empty. Please upload a valid resume PDF first."

    prompt = ATS_PROMPT.format(resume=resume_text)
    response = llm.invoke(prompt)
    return format_llm_response(response.content)


