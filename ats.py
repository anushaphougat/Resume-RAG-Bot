from langchain_groq import ChatGroq
from dotenv import load_dotenv
from prompts import ATS_PROMPT
from utils import format_llm_response
import os

load_dotenv()

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY")
)


def analyze_resume_ats(resume_text):
    """
    Runs a standalone ATS-style review of a resume.
    Returns: ATS score, summary, strengths, weaknesses,
    missing keywords, and improvement suggestions.
    """
    prompt = ATS_PROMPT.format(resume=resume_text)

    response = llm.invoke(prompt)

    return format_llm_response(response.content)


