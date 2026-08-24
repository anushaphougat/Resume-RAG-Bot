import { useState, useEffect } from "react";
import "./App.css";

import {
  uploadResume,
  askQuestion,
  analyzeAts,
  getApiBaseUrl,
  setApiBaseUrl,
  checkBackendHealth,
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

  const [isDragging, setIsDragging] = useState(false);

  // Dynamic Backend URL State
  const [backendUrl, setBackendUrlState] = useState(getApiBaseUrl());
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(null); // null | true | false
  const [healthChecking, setHealthChecking] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    setHealthChecking(true);
    try {
      await checkBackendHealth();
      setServerOnline(true);
    } catch {
      setServerOnline(false);
    } finally {
      setHealthChecking(false);
    }
  }

  function handleSaveBackendUrl(e) {
    e.preventDefault();
    setApiBaseUrl(backendUrl);
    setIsConfigOpen(false);
    testConnection();
  }

  async function handleUpload() {
    if (!file) {
      alert("Please choose a PDF resume.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a valid PDF file.");
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
      setServerOnline(true);
    } catch (err) {
      console.error(err);
      let errMsg = "Resume upload failed.";
      if (err.response?.data?.detail) {
        errMsg = err.response.data.detail;
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        errMsg = `Cannot connect to backend at ${getApiBaseUrl()}.\n\nIf you deployed the frontend on Netlify, please click "Backend Settings" at the top and enter your live Railway backend URL (e.g. https://...up.railway.app).`;
      } else if (err.message) {
        errMsg = err.message;
      }
      alert(errMsg);
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
      setAnswer(res.answer || "No response received.");
    } catch (err) {
      console.error(err);
      let errMsg = "Unable to generate an answer.";
      if (err.response?.data?.detail) {
        errMsg = err.response.data.detail;
      } else if (err.code === "ERR_NETWORK") {
        errMsg = `Connection lost to backend at ${getApiBaseUrl()}. Please check your backend URL.`;
      }
      setAnswer(errMsg);
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
      setAtsResult(res.ats_review || "No review generated.");
    } catch (err) {
      console.error(err);
      let errMsg = "Unable to analyze the resume.";
      if (err.response?.data?.detail) {
        errMsg = err.response.data.detail;
      } else if (err.code === "ERR_NETWORK") {
        errMsg = `Connection lost to backend at ${getApiBaseUrl()}. Please check your backend URL.`;
      }
      setAtsResult(errMsg);
    } finally {
      setAtsLoading(false);
    }
  }

  function handleFileDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setFile(droppedFile);
      } else {
        alert("Please drop a PDF file.");
      }
    }
  }

  return (
    <div className="app">

      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-text">
            <h1>Resume<span>AI</span></h1>
            <p>RAG-powered resume intelligence</p>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className={`server-badge ${serverOnline === true ? "online" : serverOnline === false ? "offline" : ""}`}
            onClick={() => setIsConfigOpen(true)}
            title="Click to configure Backend API URL"
          >
            <span className="dot"></span>
            {healthChecking
              ? "Connecting…"
              : serverOnline === true
              ? "Backend Online"
              : "Set Backend URL"}
          </button>

          <div className={uploaded ? "status-pill success" : "status-pill"}>
            <span className="dot"></span>
            {uploaded ? "AI Ready" : "Awaiting Resume"}
          </div>
        </div>
      </header>

      {/* Backend URL Settings Modal / Banner */}
      {isConfigOpen && (
        <div className="modal-backdrop" onClick={() => setIsConfigOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Backend API Configuration</h3>
            <p>
              Enter the URL of your FastAPI backend service (e.g. your live Railway URL or localhost):
            </p>
            <form onSubmit={handleSaveBackendUrl}>
              <input
                type="text"
                className="url-input"
                value={backendUrl}
                onChange={(e) => setBackendUrlState(e.target.value)}
                placeholder="https://your-app.up.railway.app or http://127.0.0.1:8000"
              />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsConfigOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offline Alert if deployed on HTTPS but pointing to localhost */}
      {serverOnline === false && (
        <div className="offline-banner" onClick={() => setIsConfigOpen(true)}>
          ⚠️ Cannot connect to backend at <code>{getApiBaseUrl()}</code>.
          Click here to enter your Railway / Render backend URL.
        </div>
      )}

      {/* Landscape shell: sidebar + main */}
      <div className="shell">

        {/* Sidebar */}
        <aside className="sidebar">

          <div className="paper-card">
            <label
              htmlFor="resume-upload"
              className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
            >
              <h3>{file ? "Resume selected" : "Drop resume here"}</h3>
              <p>{file ? file.name : "or click to browse"}</p>
              <span className="format-tag">PDF only</span>
            </label>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />

            <button
              className="btn-primary upload-btn"
              onClick={handleUpload}
              disabled={uploadLoading || !file}
            >
              {uploadLoading ? "Indexing…" : "Upload & Index"}
            </button>

            {!uploaded && file && !uploadLoading && (
              <p className="upload-hint">Click &quot;Upload &amp; Index&quot; to activate AI</p>
            )}
            {uploaded && (
              <p className="upload-hint success-hint">Indexed &amp; ready to chat</p>
            )}
          </div>

          <div className="stat-block">

            <div className="stat-row">
              <div className="stat-copy">
                <span className="stat-label">Resume</span>
                <span className="stat-value" title={uploaded ? resumeName : "Not uploaded"}>
                  {uploaded ? resumeName : "Not uploaded"}
                </span>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-copy">
                <span className="stat-label">Indexed chunks</span>
                <span className="stat-value mono">{chunks}</span>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-copy">
                <span className="stat-label">AI status</span>
                <span className={`stat-value ${uploaded ? "ready-tag" : ""}`}>
                  {uploadLoading ? "Indexing…" : uploaded ? "Ready" : "Awaiting Upload"}
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
              Ask Resume AI
            </button>
            <button
              className={activeTab === "ats" ? "tab active" : "tab"}
              onClick={() => setActiveTab("ats")}
            >
               ATS Analysis
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
