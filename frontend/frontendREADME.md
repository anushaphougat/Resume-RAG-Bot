# ResumeAI - Frontend

The frontend interface for **ResumeAI**, an AI-powered resume intelligence platform.  
It provides a modern dashboard experience where users can upload resumes, interact with Resume AI, and receive ATS-based resume feedback.

## Features

- 📄 PDF resume upload interface
- 🧠 Resume indexing status tracking
- 💬 AI-powered resume Q&A
- 📋 ATS resume analysis
- 🔍 Quick prompt suggestions
- ⚡ Real-time loading animations
- 📊 Resume information dashboard
- 📱 Responsive design for different screen sizes

## UI Design

The application uses a custom dark-themed dashboard design featuring:

- Glass/dark interface styling
- Paper-style resume upload card
- Custom typography using:
  - Space Grotesk
  - Inter
  - IBM Plex Mono
- Responsive sidebar + main panel layout
- Animated AI processing indicators
- Custom color system with amber and teal highlights

## Tech Stack

### Frontend

- React.js
- JavaScript
- Vite
- CSS3
- Axios
- React Icons

## Main Components

### Resume Upload

Allows users to:

- Select a PDF resume
- Upload and index the document
- View uploaded file information
- Track indexed document chunks

### Ask Resume AI

Users can ask questions about their resume:

Examples:

- Summarize my resume
- What are my technical skills?
- What projects have I worked on?
- What education do I have?

Responses are generated from the uploaded resume using the RAG pipeline.

### ATS Analysis

Provides resume evaluation including:

- Strengths
- Weaknesses
- Improvement recommendations
- ATS-style feedback

## Project Structure

```
frontend/
│
├── src/
│   │
│   ├── App.jsx          # Main React application
│   ├── App.css          # Complete UI styling
│   ├── api.js           # Backend API functions
│   │
│   └── assets/
│
├── public/
│
├── package.json
├── vite.config.js
└── README.md
```

## Installation

```bash
cd frontend

npm install
```

## Running the Application

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

## Backend Requirement

The frontend requires the ResumeAI backend API to be running.

Backend provides:

- Resume upload endpoint
- Question answering endpoint
- ATS analysis endpoint

## Available Scripts

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Future Improvements

- Resume comparison
- Job description matching
- User accounts
- Chat history
- Resume scoring dashboard
- Cloud deployment

## Author

Anusha Phougat