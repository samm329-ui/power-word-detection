import axios from "axios";
import { Job, Segment } from "./types";

// Use relative paths — Next.js rewrite in next.config.js proxies /api/* to the backend.
// This avoids CORS entirely since the browser only talks to localhost:3000.
const api = axios.create({
  baseURL: "/api",
  timeout: 300000, // 5 min for large uploads
});

export async function createJob(
  file: File,
  wordsPerLine: number,
  targetLang: string = "en",
  intensity: string = "medium"
): Promise<Job> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("words_per_line", wordsPerLine.toString());
  formData.append("target_lang", targetLang);
  formData.append("intensity", intensity);

  const response = await api.post<Job>("/jobs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getJob(jobId: string): Promise<Job> {
  const response = await api.get<Job>(`/jobs/${jobId}`);
  return response.data;
}

export async function getSegments(jobId: string): Promise<Segment[]> {
  const response = await api.get<{ segments: Segment[] }>(
    `/jobs/${jobId}/segments`
  );
  return response.data.segments;
}

export function createWebSocket(jobId: string): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new WebSocket(`${protocol}//${window.location.host}/api/jobs/${jobId}/ws`);
}
