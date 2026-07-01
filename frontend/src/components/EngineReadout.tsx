import type { Provider } from "../types";

interface EngineReadoutProps {
  active: Provider;
  onChange: (provider: Provider) => void;
  lastLatencyMs: number | null;
}

const ENGINES: { id: Provider; label: string }[] = [
  { id: "gemini", label: "Gemini" },
  { id: "groq", label: "Groq" },
];

export default function EngineReadout({ active, onChange, lastLatencyMs }: EngineReadoutProps) {
  return (
    <div className="engine-readout" role="group" aria-label="Active AI engine">
      <div className="engine-readout-switches">
        {ENGINES.map((engine) => {
          const isActive = active === engine.id;
          return (
            <button
              key={engine.id}
              type="button"
              aria-pressed={isActive}
              className={`engine-switch engine-switch-${engine.id}${isActive ? " is-active" : ""}`}
              onClick={() => onChange(engine.id)}
            >
              <span className="engine-switch-dot" aria-hidden="true" />
              {engine.label}
            </button>
          );
        })}
      </div>

      <div className="engine-readout-metric">
        <span className="engine-readout-metric-label">last response</span>
        <span className="engine-readout-metric-value">
          {lastLatencyMs === null ? "—" : `${lastLatencyMs}ms`}
        </span>
      </div>

      <style>{`
        .engine-readout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-3) var(--space-5);
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-hairline);
        }
        .engine-readout-switches {
          display: flex;
          gap: var(--space-2);
        }
        .engine-switch {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-strong);
          background: var(--bg-surface-raised);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 120ms ease, color 120ms ease, background-color 120ms ease;
        }
        .engine-switch:hover {
          color: var(--text-primary);
        }
        .engine-switch-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--border-strong);
        }
        .engine-switch-gemini.is-active {
          border-color: var(--gemini-border);
          background: var(--gemini-dim);
          color: var(--gemini-text);
        }
        .engine-switch-gemini.is-active .engine-switch-dot {
          background: var(--gemini);
        }
        .engine-switch-groq.is-active {
          border-color: var(--groq-border);
          background: var(--groq-dim);
          color: var(--groq-text);
        }
        .engine-switch-groq.is-active .engine-switch-dot {
          background: var(--groq);
        }
        .engine-readout-metric {
          display: flex;
          align-items: baseline;
          gap: var(--space-2);
          font-family: var(--font-mono);
        }
        .engine-readout-metric-label {
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }
        .engine-readout-metric-value {
          font-size: 14px;
          color: var(--text-secondary);
          min-width: 48px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
