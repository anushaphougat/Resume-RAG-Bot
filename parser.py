import fitz   #PyMuPDF
from utils import clean_text

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF file.
    """
    text = ""
    
    try:
        document = fitz.open(pdf_path)
        for page in document:
            text += page.get_text()
    except Exception as e:
        print(f"Error occurred while extracting text from PDF: {e}")
    finally:
        if 'document' in locals():
            document.close()
    
    return clean_text(text)