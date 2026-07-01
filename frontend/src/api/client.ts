import type { Provider } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://multimodel-ai-production.up.railway.app/";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: isFormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface ChatResult {
  content: string;
  latency_ms: number;
}

export function sendChat(provider: Provider, history: { role: string; content: string }[]) {
  return request<ChatResult>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ provider, history }),
  });
}

export interface DocumentResult {
  doc_id: string;
  name: string;
  char_count: number;
}

export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<DocumentResult>("/api/documents/upload", { method: "POST", body: formData });
}

export function addDocumentFromUrl(url: string) {
  const formData = new FormData();
  formData.append("url", url);
  return request<DocumentResult>("/api/documents/from-url", { method: "POST", body: formData });
}

export function chatWithDocument(docId: string, provider: Provider, prompt: string) {
  return request<ChatResult>("/api/documents/chat", {
    method: "POST",
    body: JSON.stringify({ doc_id: docId, provider, prompt }),
  });
}
