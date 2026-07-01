import { useState, type ChangeEvent, type FormEvent } from "react";

interface DocSourcePickerProps {
  onUpload: (file: File) => void;
  onUrl: (url: string) => void;
  busy: boolean;
}

export default function DocSourcePicker({ onUpload, onUrl, busy }: DocSourcePickerProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleUrlSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (url.trim()) onUrl(url.trim());
  };

  return (
    <div className="doc-picker">
      <div className="doc-picker-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "upload"}
          className={tab === "upload" ? "is-active" : ""}
          onClick={() => setTab("upload")}
        >
          Upload PDF
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "url"}
          className={tab === "url" ? "is-active" : ""}
          onClick={() => setTab("url")}
        >
          From URL
        </button>
      </div>

      {tab === "upload" ? (
        <label className="doc-picker-dropzone">
          <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={busy} />
          {busy ? "Reading document…" : "Choose a PDF file"}
        </label>
      ) : (
        <form className="doc-picker-url" onSubmit={handleUrlSubmit}>
          <input
            type="url"
            placeholder="https://example.com/paper.pdf"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !url.trim()}>
            {busy ? "Fetching…" : "Load"}
          </button>
        </form>
      )}

      <style>{`
        .doc-picker {
          max-width: 360px;
          margin: 0 auto;
        }
        .doc-picker-tabs {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }
        .doc-picker-tabs button {
          flex: 1;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: var(--bg-surface-raised);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
        }
        .doc-picker-tabs button.is-active {
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }
        .doc-picker-dropzone {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          border: 1px dashed var(--border-strong);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
        }
        .doc-picker-dropzone input {
          display: none;
        }
        .doc-picker-url {
          display: flex;
          gap: var(--space-2);
        }
        .doc-picker-url input {
          flex: 1;
          padding: var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: var(--bg-surface-raised);
          font-size: 14px;
        }
        .doc-picker-url button {
          padding: 0 var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: var(--bg-surface-raised);
          color: var(--text-primary);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
