import os
import re


def clean_text(text):
    """
    Cleans extracted resume text.
    """
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def validate_pdf(filename):
    """
    Checks whether the uploaded file is a PDF.
    """
    return filename.lower().endswith(".pdf")


def ensure_directory(directory):
    """
    Creates a directory if it doesn't exist.
    """
    os.makedirs(directory, exist_ok=True)


def save_uploaded_file(upload_file, file_path):
    """
    Saves an uploaded file.
    """
    with open(file_path, "wb") as buffer:
        buffer.write(upload_file.file.read())


def format_llm_response(response):
    """
    Cleans the LLM response before returning it.
    """
    if isinstance(response, str):
        return response.strip()

    return str(response).strip()