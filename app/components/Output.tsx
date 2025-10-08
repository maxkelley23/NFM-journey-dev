"use client";

import { useEffect, useState } from "react";

type OutputProps = {
  text: string;
  isLoading?: boolean;
  onReset?: () => void;
};

export const Output = ({ text, isLoading, onReset }: OutputProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy campaign text", error);
    }
  };

  if (isLoading) {
    return (
      <section className="output-card">
        <h2>Campaign Output</h2>
        <p>Generating your journey…</p>
      </section>
    );
  }

  if (!text) {
    return (
      <section className="output-card muted">
        <h2>Campaign Output</h2>
        <p>We&apos;ll display the full email series here once it&apos;s ready.</p>
      </section>
    );
  }

  return (
    <section className="output-card">
      <header className="output-header">
        <h2>Campaign Output</h2>
        <div className="output-actions">
          {onReset && (
            <button type="button" className="secondary" onClick={onReset}>
              Start over
            </button>
          )}
          <button type="button" className="primary" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy all"}
          </button>
        </div>
      </header>

      <pre>{text}</pre>

      <style jsx>{`
        .output-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .output-card.muted {
          color: #475569;
          text-align: center;
        }

        .output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .output-actions {
          display: flex;
          gap: 0.5rem;
        }

        h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        pre {
          white-space: pre-wrap;
          font-family: "Source Code Pro", ui-monospace, SFMono-Regular, SFMono-Regular,
            Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .primary,
        .secondary {
          border-radius: 999px;
          padding: 0.5rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .primary {
          background: #2563eb;
          color: white;
        }

        .secondary {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>
    </section>
  );
};
