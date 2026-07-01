export type Provider = "gemini" | "groq";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: Provider;
  latencyMs?: number;
}

export interface DocumentMeta {
  docId: string;
  name: string;
  charCount: number;
}

export interface Conversation {
  id: string;
  createdAt: number;
  updatedAt: number;
  document?: DocumentMeta;
  messages: ChatMessage[];
}
