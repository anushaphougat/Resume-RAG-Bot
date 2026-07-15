# Resume RAG Bot - Backend

This is the backend API for the Resume RAG Bot application. It handles resume uploads, PDF text extraction, document processing, embeddings generation, and AI-based question answering using a Retrieval-Augmented Generation (RAG) pipeline.

## Features

- Upload resume PDFs
- Extract text from resumes
- Clean and preprocess extracted text
- Split documents into chunks
- Generate embeddings
- Retrieve relevant resume information
- Answer user questions using AI
- REST API built with Flask

## Tech Stack

- Python
- Flask
- PyMuPDF (PDF processing)
- LangChain
- FAISS / Vector Database
- Sentence Transformers
- LLM API
- Python-dotenv

## Backend Structure

```
backend/
│
├── app.py                 # Main Flask application
├── requirements.txt       # Dependencies
├── .env                   # Environment variables
│
├── routes/                # API endpoints
│
├── utils/                 # Helper functions
│   ├── pdf_utils.py       # PDF extraction
│   └── text_utils.py      # Text cleaning
│
├── uploads/               # Uploaded resume files
│
└── embeddings/            # Stored vector embeddings
```

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/Resume-RAG-Bot.git
```

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment:

Windows:

```bash
venv\Scripts\activate
```

Install required packages:

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file inside the backend folder:

```env
API_KEY=your_api_key_here
```

Add your required API keys and configuration values.

## Running the Backend

Start the Flask server:

```bash
python app.py
```

The backend will start at:

```
http://127.0.0.1:5000
```

## API Endpoints

### 1. Upload Resume

**POST**

```
/upload
```

Uploads and processes a resume PDF.

Request:
- File: PDF resume

Example response:

```json
{
    "message": "Resume uploaded successfully"
}
```

---

### 2. Ask Resume AI

**POST**

```
/ask
```

Ask questions based on the uploaded resume.

Request:

```json
{
    "question": "What skills does this candidate have?"
}
```

Example response:

```json
{
    "answer": "The candidate has skills in Python, Machine Learning, and Data Analysis."
}
```

## Running Locally

1. Start the backend server.
2. Start the frontend application separately.
3. Connect the frontend API calls to the backend URL.

## Future Improvements

- Support multiple resume uploads
- Add user authentication
- Improve retrieval accuracy
- Deploy backend using cloud services
- Add resume scoring and job matching features

## Author

Anusha Phougat