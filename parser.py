import pymupdf as fitz
from utils import clean_text

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF file.
    """
    text = ""
    try:
        document = fitz.open(pdf_path)
        for page in document:
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
        document.close()
    except Exception as e:
        print(f"Error occurred while extracting text from PDF: {e}")

    return clean_text(text)