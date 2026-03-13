import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  timeout: 60000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (name, email, password) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await api.post("/resume/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const rewriteResume = async (resumeText) => {
  const { data } = await api.post("/resume/rewrite", { resumeText });
  return data;
};

export const matchJob = async (jobDescription) => {
  const { data } = await api.post("/resume/jobmatch", { jobDescription });
  return data;
};

export const interviewChat = async (payload) => {
  const { data } = await api.post("/resume/interview", payload);
  return data;
};

