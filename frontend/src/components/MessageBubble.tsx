import type { ChatMessage } from "../types";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`bubble-row${isUser ? " bubble-row-user" : ""}`}>
      <div className={`bubble${isUser ? " bubble-user" : ` bubble-${message.provider ?? "gemini"}`}`}>
        {!isUser && (
          <div className="bubble-meta">
            {message.provider}
            {typeof message.latencyMs === "number" ? ` · ${message.latencyMs}ms` : ""}
          </div>
        )}
        <p className="bubble-content">{message.content}</p>
      </div>

      <style>{`
        .bubble-row {
          display: flex;
          margin-bottom: var(--space-4);
        }
        .bubble-row-user {
          justify-content: flex-end;
        }
        .bubble {
          max-width: 70%;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-hairline);
          background: var(--bg-surface-raised);
        }
        .bubble-user {
          background: var(--bg-surface);
        }
        .bubble-gemini {
          background: var(--gemini-dim);
          border-color: var(--gemini-border);
        }
        .bubble-groq {
          background: var(--groq-dim);
          border-color: var(--groq-border);
        }
        .bubble-meta {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.03em;
          color: var(--text-muted);
          margin-bottom: var(--space-1);
          text-transform: uppercase;
        }
        .bubble-content {
          margin: 0;
          white-space: pre-wrap;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
