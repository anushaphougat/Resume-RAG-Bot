import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export const api = axios.create({
  baseURL: API_URL,
});

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload_resume/", formData);
  return data;
}

export async function askQuestion(question) {
  const { data } = await api.post("/ask-question/", { question });
  return data;
}

export async function analyzeAts(filename) {
  const { data } = await api.post("/analyze-ats/", { filename });
  return data;
}

export async function matchJob(filename, jobDescription) {
  const { data } = await api.post("/match-job/", {
    filename,
    job_description: jobDescription,
  });
  return data;
}
