"use client";

import { useState } from "react";
import { ModernChat } from "@/app/components/ModernChat";
import { ModernOutput } from "@/app/components/ModernOutput";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
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
    <main className="min-h-screen p-4 md:p-8">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto space-y-8">
        <ModernChat key={sessionId} onComplete={handleComplete} isLoading={isLoading} />

        {error && (
          <motion.div
            className="card p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <strong className="text-red-900 dark:text-red-200">We hit a snag:</strong>
                <span className="ml-2 text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          </motion.div>
        )}

        <ModernOutput text={campaignText} isLoading={isLoading} onReset={answers ? handleReset : undefined} />

        {plan && !campaignText && (
          <motion.section
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Plan Overview
            </h3>
            <div className="space-y-3">
              {plan.steps.map((step, index) => (
                <motion.div
                  key={`${step.type}-${step.n}`}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    {step.n}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                    step.type === 'email'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  }`}>
                    {step.type}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Day {step.delay}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    {step.purpose}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
