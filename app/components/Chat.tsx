"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_ANSWERS,
  INTAKE_STEPS,
  IntakeAnswers,
  IntakeDraft,
  IntakePrompt
} from "@/app/lib/catalog/intake";
import { toApiIntake } from "@/app/lib/catalog/intake";

type ChatProps = {
  onComplete: (answers: IntakeAnswers, payload: ReturnType<typeof toApiIntake>) => void;
  isLoading?: boolean;
};

type PromptErrors = Record<string, string>;

const defaultDrafts: Record<string, IntakeDraft> = {
  lengthCadence: { lengthNotes: "Decide for me", cadenceNotes: "Decide for me" },
  sms: { includeSms: false, smsPlacementNotes: "" }
};

export const Chat = ({ onComplete, isLoading }: ChatProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(DEFAULT_ANSWERS);
  const [drafts, setDrafts] = useState<Record<string, IntakeDraft>>(defaultDrafts);
  const [errors, setErrors] = useState<PromptErrors>({});

  const currentStep = INTAKE_STEPS[stepIndex];
  const currentDraft = drafts[currentStep.id] ?? {};
  const isLastStep = stepIndex === INTAKE_STEPS.length - 1;

  const summary = useMemo(() => ({
    goal: answers.goal,
    audience: answers.audience,
    length: answers.length,
    cadence: answers.cadence,
    includeSms: answers.includeSms,
    smsPlacement: answers.smsPlacement,
    emphasize: answers.emphasize,
    avoid: answers.avoid,
    abSubjects: answers.abSubjects
  }), [answers]);

  const handleDraftChange = (prompt: IntakePrompt, value: string | boolean) => {
    setDrafts((prev) => ({
      ...prev,
      [currentStep.id]: {
        ...prev[currentStep.id],
        [prompt.id]: value
      }
    }));
  };

  const handleSubmit = () => {
    setErrors({});
    const validation = currentStep.validate(currentDraft);

    if (!validation.success) {
      setErrors(validation.errors ?? {});
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      ...(validation.values ?? {})
    }));

    if (validation.draft) {
      setDrafts((prev) => ({
        ...prev,
        [currentStep.id]: {
          ...prev[currentStep.id],
          ...validation.draft
        }
      }));
    }

    if (isLastStep) {
      const payload = toApiIntake({
        ...answers,
        ...(validation.values ?? {})
      });
      onComplete(
        {
          ...answers,
          ...(validation.values ?? {})
        },
        payload
      );
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h1>NewFed Campaign Builder</h1>
        <p>Answer a few quick questions and we&apos;ll draft the full journey.</p>
      </div>

      <div className="chat-body">
        <div className="step-indicator">
          Step {stepIndex + 1} of {INTAKE_STEPS.length}
        </div>

        <h2>{currentStep.title}</h2>

        <form
          className="prompt-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          {currentStep.prompts.map((prompt) =>
            prompt.showWhen && !prompt.showWhen(currentDraft)
              ? null
              : renderPrompt(prompt, currentDraft, errors[prompt.id as string], handleDraftChange)
          )}

          <div className="form-actions">
            {stepIndex > 0 && (
              <button type="button" className="secondary" onClick={handleBack}>
                Back
              </button>
            )}

            <button type="submit" className="primary" disabled={isLoading}>
              {isLastStep ? (isLoading ? "Generating…" : "Generate campaign") : "Next"}
            </button>
          </div>
        </form>
      </div>

      <aside className="chat-summary">
        <h3>Progress</h3>
        <dl>
          <dt>Goal</dt>
          <dd>{summary.goal || "-"}</dd>
          <dt>Audience</dt>
          <dd>{summary.audience || "-"}</dd>
          <dt>Cadence</dt>
          <dd>
            {summary.length
              ? `${summary.length} steps${summary.cadence ? ` · ${summary.cadence}` : ""}`
              : "Default 8 touches / 45 days"}
          </dd>
          <dt>SMS</dt>
          <dd>
            {summary.includeSms
              ? `Yes (steps ${summary.smsPlacement.join(", ") || "3, 7"})`
              : "No"}
          </dd>
          <dt>Emphasize</dt>
          <dd>{summary.emphasize || "-"}</dd>
          <dt>Avoid</dt>
          <dd>{summary.avoid || "-"}</dd>
          <dt>A/B subjects</dt>
          <dd>{summary.abSubjects ? "Yes" : "No"}</dd>
        </dl>
      </aside>

      <style jsx>{`
        .chat-panel {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: minmax(0, 1fr);
        }

        @media (min-width: 960px) {
          .chat-panel {
            grid-template-columns: 3fr 2fr;
          }
        }

        .chat-header {
          grid-column: 1 / -1;
          background: #e2e8f0;
          padding: 1.5rem;
          border-radius: 1rem;
        }

        .chat-header h1 {
          margin: 0;
          font-size: 1.75rem;
        }

        .chat-body {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }

        .step-indicator {
          font-size: 0.875rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        h2 {
          margin: 0.75rem 0 1rem;
          font-size: 1.2rem;
        }

        .prompt-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          display: block;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid #cbd5f5;
          font-size: 1rem;
        }

        input[type="text"]:focus,
        textarea:focus {
          outline: 2px solid #2563eb;
          border-color: #2563eb;
        }

        textarea {
          min-height: 120px;
          resize: vertical;
        }

        .options {
          display: flex;
          gap: 0.75rem;
        }

        .toggle {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.75rem;
          text-align: center;
          cursor: pointer;
          border: 1px solid #cbd5f5;
          background: #f8fafc;
        }

        .toggle.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .error {
          color: #dc2626;
          font-size: 0.875rem;
        }

        .helper {
          font-size: 0.875rem;
          color: #475569;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .primary,
        .secondary {
          border-radius: 999px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .primary {
          background: #2563eb;
          color: white;
        }

        .primary[disabled] {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .secondary {
          background: #e2e8f0;
          color: #1e293b;
        }

        .chat-summary {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }

        .chat-summary h3 {
          margin-top: 0;
          font-size: 1.1rem;
        }

        dl {
          margin: 0;
          display: grid;
          gap: 0.75rem;
        }

        dt {
          font-weight: 600;
          color: #475569;
        }

        dd {
          margin: 0.25rem 0 0 0;
        }
      `}</style>
    </div>
  );
};

const renderPrompt = (
  prompt: IntakePrompt,
  draft: IntakeDraft,
  error: string | undefined,
  onChange: (prompt: IntakePrompt, value: string | boolean) => void
) => {
  if (prompt.type === "boolean") {
    const value = draft[prompt.id];
    return (
      <div key={prompt.id.toString()}>
        <label>{prompt.label}</label>
        {prompt.helper && <p className="helper">{prompt.helper}</p>}
        <div className="options">
          <button
            type="button"
            className={`toggle ${value === true ? "active" : ""}`}
            onClick={() => onChange(prompt, true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`toggle ${value === false ? "active" : ""}`}
            onClick={() => onChange(prompt, false)}
          >
            No
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div key={prompt.id.toString()}>
      <label htmlFor={prompt.id.toString()}>{prompt.label}</label>
      {prompt.helper && <p className="helper">{prompt.helper}</p>}
      <input
        id={prompt.id.toString()}
        type="text"
        placeholder={prompt.placeholder}
        value={(draft[prompt.id] as string | undefined) ?? ""}
        onChange={(event) => onChange(prompt, event.target.value)}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
};
