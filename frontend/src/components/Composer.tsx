import { useState, type KeyboardEvent } from "react";
import Icon from "./Icon";

interface ComposerProps {
  placeholder: string;
  disabled?: boolean;
  onSend: (text: string) => void;
}

export default function Composer({ placeholder, disabled, onSend }: ComposerProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="composer">
      <textarea
        rows={1}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Message"
      />
      <button type="button" onClick={submit} disabled={disabled || !value.trim()} aria-label="Send message">
        <Icon name="send" size={16} />
      </button>

      <style>{`
        .composer {
          display: flex;
          align-items: flex-end;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--border-hairline);
          background: var(--bg-surface);
        }
        .composer textarea {
          flex: 1;
          min-height: 44px;
          max-height: 160px;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: var(--bg-surface-raised);
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.5;
        }
        .composer textarea:focus {
          outline: 2px solid var(--gemini-border);
          outline-offset: 1px;
        }
        .composer textarea::placeholder {
          color: var(--text-muted);
        }
        .composer button {
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
        .composer button:hover:not(:disabled) {
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }
        .composer button:disabled {
          opacity: 0.5;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
