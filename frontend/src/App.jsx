import { useState } from "react";
import "./App.css";

import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaBrain,
  FaCheckCircle,
  FaSearch,
  FaClipboardList,
} from "react-icons/fa";

import {
  uploadResume,
  askQuestion,
  analyzeAts,
} from "./api";

export default function App() {

  const [file, setFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [chunks, setChunks] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  const [activeTab, setActiveTab] = useState("ask"); // "ask" | "ats"

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [atsResult, setAtsResult] = useState("");

  const [uploadLoading, setUploadLoading] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);

  async function handleUpload() {
    if (!file) {
      alert("Please choose a PDF resume.");
      return;
    }

    setUploadLoading(true);

    try {
      const res = await uploadResume(file);
      setResumeName(res.filename);
      setChunks(res.total_chunks);
      setUploaded(true);
      setAnswer("");
      setAtsResult("");
    } catch (err) {
      console.error(err);
      alert("Resume upload failed.");
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleAsk() {
    if (!uploaded) {
      alert("Upload a resume first.");
      return;
    }
    if (!question.trim()) return;

    setAskLoading(true);
    setAnswer("");

    try {
      const res = await askQuestion(question);
      setAnswer(res.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Unable to generate an answer.");
    } finally {
      setAskLoading(false);
    }
  }

  async function handleATS() {
    if (!uploaded) {
      alert("Upload a resume first.");
      return;
    }

    setAtsLoading(true);
    setAtsResult("");

    try {
      const res = await analyzeAts(resumeName);
      setAtsResult(res.ats_review);
    } catch (err) {
      console.error(err);
      setAtsResult("Unable to analyze the resume.");
    } finally {
      setAtsLoading(false);
    }
  }

  return (
    <div className="app">

      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <FaFilePdf />
          </div>
          <div className="brand-text">
            <h1>Resume<span>AI</span></h1>
            <p>RAG-powered resume intelligence</p>
          </div>
        </div>

        <div className={uploaded ? "status-pill success" : "status-pill"}>
          <span className="dot"></span>
          {uploaded ? "AI Ready" : "Awaiting Resume"}
        </div>
      </header>

      {/* Landscape shell: sidebar + main */}
      <div className="shell">

        {/* Sidebar */}
        <aside className="sidebar">

          <div className="paper-card">
            <label htmlFor="resume-upload" className="upload-dropzone">
              <FaCloudUploadAlt className="upload-icon" />
              <h3>{file ? "Resume selected" : "Drop resume here"}</h3>
              <p>{file ? file.name : "or click to browse"}</p>
              <span className="format-tag">PDF only</span>
            </label>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button
              className="btn-primary upload-btn"
              onClick={handleUpload}
              disabled={uploadLoading}
            >
              {uploadLoading ? "Indexing…" : "Upload & Index"}
            </button>
          </div>

          <div className="stat-block">

            <div className="stat-row">
              <div className="stat-icon"><FaFilePdf /></div>
              <div className="stat-copy">
                <span className="stat-label">Resume</span>
                <span className="stat-value">
                  {uploaded ? resumeName : "Not uploaded"}
                </span>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-icon"><FaBrain /></div>
              <div className="stat-copy">
                <span className="stat-label">Indexed chunks</span>
                <span className="stat-value mono">{chunks}</span>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-icon"><FaCheckCircle /></div>
              <div className="stat-copy">
                <span className="stat-label">AI status</span>
                <span className="stat-value">
                  {uploaded ? "Ready" : "Offline"}
                </span>
              </div>
            </div>

          </div>

          <p className="sidebar-footnote">
            FastAPI · LangChain · FAISS · Groq
          </p>

        </aside>

        {/* Main panel */}
        <main className="main">

          <nav className="tabs">
            <button
              className={activeTab === "ask" ? "tab active" : "tab"}
              onClick={() => setActiveTab("ask")}
            >
              <FaSearch /> Ask Resume AI
            </button>
            <button
              className={activeTab === "ats" ? "tab active" : "tab"}
              onClick={() => setActiveTab("ats")}
            >
              <FaClipboardList /> ATS Analysis
            </button>
          </nav>

          {activeTab === "ask" && (
            <section className="panel">

              <p className="panel-text">
                Ask questions about the uploaded resume. Answers are grounded
                only in the document itself.
              </p>

              <div className="chips">
                <button className="chip" onClick={() => setQuestion("Summarize my resume")}>
                  Summarize
                </button>
                <button className="chip" onClick={() => setQuestion("What are my technical skills?")}>
                  Technical Skills
                </button>
                <button className="chip" onClick={() => setQuestion("What projects have I worked on?")}>
                  Projects
                </button>
                <button className="chip" onClick={() => setQuestion("What education do I have?")}>
                  Education
                </button>
              </div>

              <textarea
                rows="4"
                placeholder="Ask something about your resume…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <button className="btn-primary" onClick={handleAsk} disabled={askLoading}>
                {askLoading ? "Thinking…" : "Ask AI"}
              </button>

              <div className="response">
                {askLoading ? (
                  <div className="scan-loader">
                    <div className="scan-bar"></div>
                    <span>Reading resume…</span>
                  </div>
                ) : answer ? (
                  answer
                ) : (
                  <span className="placeholder">Your AI response will appear here…</span>
                )}
              </div>

            </section>
          )}

          {activeTab === "ats" && (
            <section className="panel">

              <p className="panel-text">
                Run an ATS-style review of the uploaded resume — strengths,
                weaknesses, and concrete suggestions.
              </p>

              <button className="btn-primary" onClick={handleATS} disabled={atsLoading}>
                {atsLoading ? "Analyzing…" : "Analyze Resume"}
              </button>

              <div className="response">
                {atsLoading ? (
                  <div className="scan-loader">
                    <div className="scan-bar"></div>
                    <span>Scoring against ATS criteria…</span>
                  </div>
                ) : atsResult ? (
                  atsResult
                ) : (
                  <span className="placeholder">Your ATS analysis will appear here…</span>
                )}
              </div>

            </section>
          )}

        </main>

      </div>

      <footer>
        <p>ResumeAI — Built with React · FastAPI · LangChain · FAISS · HuggingFace · Groq</p>
      </footer>

    </div>
  );
}
