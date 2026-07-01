import { useState } from "react";
import { addDocumentFromUrl, chatWithDocument, sendChat, uploadDocument } from "../api/client";
import { useConversations } from "../state/conversations";
import type { ChatMessage, Provider } from "../types";
import Composer from "./Composer";
import DocSourcePicker from "./DocSourcePicker";
import Icon from "./Icon";
import MessageBubble from "./MessageBubble";

interface ChatThreadProps {
  provider: Provider;
  onLatency: (ms: number) => void;
}

export default function ChatThread({ provider, onLatency }: ChatThreadProps) {
  const { activeConversation, addMessage, attachDocument, detachDocument } = useConversations();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [docBusy, setDocBusy] = useState(false);

  if (!activeConversation) {
    // The provider always guarantees at least one conversation exists.
    return null;
  }

  const conversation = activeConversation;

  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    addMessage(conversation.id, userMessage);
    setPending(true);
    setError(null);

    try {
      const result = conversation.document
        ? await chatWithDocument(conversation.document.docId, provider, text)
        : await sendChat(
            provider,
            [...conversation.messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          );

      addMessage(conversation.id, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.content,
        provider,
        latencyMs: result.latency_ms,
      });
      onLatency(result.latency_ms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  const handleAttach = async (loader: () => Promise<{ doc_id: string; name: string; char_count: number }>) => {
    setDocBusy(true);
    setError(null);
    try {
      const result = await loader();
      attachDocument(conversation.id, { docId: result.doc_id, name: result.name, charCount: result.char_count });
      setAttaching(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that document.");
    } finally {
      setDocBusy(false);
    }
  };

  return (
    <div className="chat-thread">
      <div className="thread-scroll">
        {conversation.messages.length === 0 && !pending && (
          <p className="thread-empty">
            Ask anything, or attach a PDF below to chat about a document — both live in this same thread.
          </p>
        )}
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {pending && (
          <p className="thread-thinking" role="status">
            {provider} is thinking…
          </p>
        )}
        {error && (
          <p className="thread-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {conversation.document && (
        <div className="doc-chip">
          <Icon name="file" size={14} />
          <span>
            {conversation.document.name} · {conversation.document.charCount.toLocaleString()} chars
          </span>
          <button type="button" onClick={() => detachDocument(conversation.id)}>
            Remove
          </button>
        </div>
      )}

      {attaching && (
        <div className="attach-popover">
          <DocSourcePicker
            busy={docBusy}
            onUpload={(file) => handleAttach(() => uploadDocument(file))}
            onUrl={(url) => handleAttach(() => addDocumentFromUrl(url))}
          />
          <button type="button" className="attach-cancel" onClick={() => setAttaching(false)}>
            Cancel
          </button>
        </div>
      )}

      <div className="composer-row">
        <button
          type="button"
          className="attach-button"
          aria-label="Attach PDF"
          aria-pressed={attaching}
          onClick={() => setAttaching((v) => !v)}
        >
          <Icon name="attach" size={18} />
        </button>
        <Composer
          placeholder={conversation.document ? `Ask about ${conversation.document.name}` : "Send a message"}
          disabled={pending}
          onSend={handleSend}
        />
      </div>

      <style>{`
        .chat-thread {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .thread-scroll {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-5);
        }
        .thread-empty {
          color: var(--text-muted);
          font-size: 14px;
          text-align: center;
          max-width: 360px;
          margin: var(--space-6) auto 0;
        }
        .thread-thinking {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
          padding: var(--space-2) 0;
        }
        .thread-error {
          font-size: 13px;
          color: var(--danger);
          background: var(--danger-dim);
          border: 1px solid var(--danger);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          margin: 0;
        }
        .doc-chip {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-5);
          font-size: 13px;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-hairline);
          background: var(--bg-surface);
        }
        .doc-chip button {
          margin-left: auto;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
        }
        .doc-chip button:hover {
          color: var(--danger);
        }
        .attach-popover {
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--border-hairline);
          background: var(--bg-surface);
        }
        .attach-cancel {
          display: block;
          margin: var(--space-3) auto 0;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
        }
        .composer-row {
          display: flex;
          align-items: flex-end;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--border-hairline);
          background: var(--bg-surface);
        }
        .composer-row .composer {
          flex: 1;
          padding: 0;
          border: none;
        }
        .attach-button {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: var(--bg-surface-raised);
          color: var(--text-secondary);
          cursor: pointer;
        }
        .attach-button:hover {
          color: var(--text-primary);
        }
        .attach-button[aria-pressed="true"] {
          border-color: var(--gemini-border);
          color: var(--gemini-text);
        }
      `}</style>
    </div>
  );
}
