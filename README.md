# Resume RAG Bot 🤖

An AI-powered Resume Assistant that allows users to upload their resume and ask questions about their skills, experience, education, and other details using Retrieval-Augmented Generation (RAG).

## Overview

Resume RAG Bot combines a React frontend with a Flask backend to provide an interactive AI resume analysis experience.

The application:
- Accepts resume PDF uploads
- Extracts and processes resume text
- Creates embeddings for semantic search
- Retrieves relevant resume information
- Generates AI-powered answers to user queries

## Features

- 📄 Resume PDF upload
- 🔍 Intelligent resume search
- 💬 AI chat interface
- 🧠 RAG-based question answering
- ⚡ Fast document retrieval
- 🌐 React + Flask full-stack application

## Tech Stack

### Frontend
- React.js
- JavaScript
- CSS
- Axios
- Vite

### Backend
- Python
- Flask
- PyMuPDF
- LangChain
- FAISS
- Sentence Transformers

## Project Structure

```
Resume-RAG-Bot/
│
├── frontend/       # React user interface
│
├── backend/        # Flask API and RAG pipeline
│
├── README.md
└── .gitignore
```

## How To Run Locally

### 1. Clone Repository

```bash
git clone https://github.com/your-username/Resume-RAG-Bot.git
cd Resume-RAG-Bot
```

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on:

```
http://127.0.0.1:5000
```

### 3. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

## Application Flow

```
User
 |
React Frontend
 |
Flask API
 |
Resume Processing Pipeline
 |
Embeddings + Vector Search
 |
LLM Response
 |
User
```

## Future Improvements

- Resume scoring
- Job description matching
- Multiple resume support
- Authentication
- Cloud deployment

## Author

Anusha Phougat
