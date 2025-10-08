"use client";

import { useState } from "react";
import { Chat } from "@/app/components/Chat";
import { Output } from "@/app/components/Output";
import type { IntakeAnswers } from "@/app/lib/catalog/intake";
import { selectToneSnippets } from "@/app/lib/catalog/tone";
import type { IntakePayload } from "@/app/lib/schemas/intake";

type PlanStep = {
  n: number;
  type: "email" | "sms";
  delay: number;
  purpose: string;
};

type PlanResponse = {
  steps: PlanStep[];
};

const FALLBACK_SNIPPETS = [
  {
    id: "fallback-1",
    text: "We're here as a resource so you can choose the path that fits you best.",
    audiences: ["general"],
    purposes: ["soft-cta"]
  },
  {
    id: "fallback-2",
    text: "Here's a quick way to think about next steps - nothing formal until you're ready.",
    audiences: ["general"],
    purposes: ["set-expectations"]
  },
  {
    id: "fallback-3",
    text: "If you're exploring options, let's outline what to expect and where we can help.",
    audiences: ["general"],
    purposes: ["educate"]
  }
];

export default function HomePage() {
  const [campaignText, setCampaignText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [answers, setAnswers] = useState<IntakeAnswers | null>(null);
  const [sessionId, setSessionId] = useState(0);

  const handleReset = () => {
    setCampaignText("");
    setPlan(null);
    setError(null);
    setAnswers(null);
    setSessionId((prev) => prev + 1);
  };

  const handleComplete = async (nextAnswers: IntakeAnswers, payload: IntakePayload) => {
    setIsLoading(true);
    setError(null);
    setCampaignText("");
    setAnswers(nextAnswers);

    try {
      const planResponse = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: payload })
      });

      if (!planResponse.ok) {
        const details = await planResponse.json().catch(() => ({}));
        throw new Error(details.error ?? "Unable to generate plan.");
      }

      const planJson = (await planResponse.json()) as PlanResponse;
      setPlan(planJson);

      const emailPurposes = planJson.steps
        .filter((step) => step.type === "email")
        .map((step) => step.purpose);

      const toneCandidates = selectToneSnippets({
        audience: payload.audience,
        purposes: emailPurposes
      });

      const toneSnippets =
        toneCandidates.length > 0 ? toneCandidates.slice(0, 6) : FALLBACK_SNIPPETS;

      const writeResponse = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intake: payload,
          plan: planJson,
          toneSnippets,
          abSubjects: payload.abSubjects
        })
      });

      if (!writeResponse.ok) {
        const details = await writeResponse.json().catch(() => ({}));
        throw new Error(details.error ?? "Unable to generate campaign content.");
      }

      const { text } = (await writeResponse.json()) as { text: string };
      setCampaignText(text);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="stack">
        <Chat key={sessionId} onComplete={handleComplete} isLoading={isLoading} />
        {error && (
          <div className="error-banner">
            <strong>We hit a snag:</strong> {error}
          </div>
        )}
        <Output text={campaignText} isLoading={isLoading} onReset={answers ? handleReset : undefined} />
        {plan && (
          <section className="plan-preview">
            <h3>Plan overview</h3>
            <ol>
              {plan.steps.map((step) => (
                <li key={`${step.type}-${step.n}`}>
                  <span className="step-number">Step {step.n}</span>
                  <span className="step-type">{step.type.toUpperCase()}</span>
                  <span>Delay: {step.delay} days</span>
                  <span className="purpose">{step.purpose}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </section>

      <style jsx>{`
        .page {
          padding: 2rem clamp(1.5rem, 4vw, 3rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .error-banner {
          background: #fee2e2;
          color: #b91c1c;
          padding: 1rem;
          border-radius: 0.75rem;
        }

        .plan-preview {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }

        .plan-preview h3 {
          margin: 0 0 1rem;
        }

        .plan-preview ol {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.75rem;
        }

        .plan-preview li {
          display: grid;
          grid-template-columns: minmax(0, 120px) minmax(0, 100px) minmax(0, 120px) 1fr;
          gap: 0.5rem;
          align-items: baseline;
          padding: 0.75rem;
          border-radius: 0.75rem;
          background: #f8fafc;
        }

        .step-number {
          font-weight: 600;
        }

        .step-type {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: #2563eb;
        }

        .purpose {
          color: #475569;
        }

        @media (max-width: 720px) {
          .plan-preview li {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
