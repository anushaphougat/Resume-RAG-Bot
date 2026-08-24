import axios from "axios";

export function getApiBaseUrl() {
  const savedUrl = localStorage.getItem("resume_bot_api_url");
  if (savedUrl && savedUrl.trim()) {
    return savedUrl.trim().replace(/\/+$/, "");
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "");
  }
  return "http://127.0.0.1:8000";
}

export function setApiBaseUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem("resume_bot_api_url", url.trim().replace(/\/+$/, ""));
  } else {
    localStorage.removeItem("resume_bot_api_url");
  }
}

export const api = axios.create({
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

export async function checkBackendHealth() {
  const { data } = await api.get("/health", { timeout: 8000 });
  return data;
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload_resume/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
