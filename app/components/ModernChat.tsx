"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, AlertCircle, Sparkles, Target, Users, Clock, MessageSquare, Zap, Type } from "lucide-react";
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

const stepIcons: Record<string, React.ReactNode> = {
  goal: <Target className="w-5 h-5" />,
  audience: <Users className="w-5 h-5" />,
  lengthCadence: <Clock className="w-5 h-5" />,
  sms: <MessageSquare className="w-5 h-5" />,
  emphasis: <Sparkles className="w-5 h-5" />,
  abSubjects: <Type className="w-5 h-5" />
};

export const ModernChat = ({ onComplete, isLoading }: ChatProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(DEFAULT_ANSWERS);
  const [drafts, setDrafts] = useState<Record<string, IntakeDraft>>(defaultDrafts);
  const [errors, setErrors] = useState<PromptErrors>({});

  const currentStep = INTAKE_STEPS[stepIndex];
  const currentDraft = drafts[currentStep.id] ?? {};
  const isLastStep = stepIndex === INTAKE_STEPS.length - 1;
  const progress = ((stepIndex + 1) / INTAKE_STEPS.length) * 100;

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
    // Clear error when user starts typing
    if (errors[prompt.id as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[prompt.id as string];
        return newErrors;
      });
    }
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-3">
          NewFed Campaign Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Create personalized email journeys in minutes
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Step {stepIndex + 1} of {INTAKE_STEPS.length}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          {INTAKE_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                  ${index < stepIndex ? 'bg-green-500 text-white' :
                    index === stepIndex ? 'bg-blue-600 text-white shadow-lg scale-110' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                `}
                whileHover={{ scale: index <= stepIndex ? 1.1 : 1 }}
                whileTap={{ scale: index <= stepIndex ? 0.95 : 1 }}
              >
                {index < stepIndex ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepIcons[step.id] || <span>{index + 1}</span>
                )}
              </motion.div>
              {index < INTAKE_STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 transition-colors duration-300 ${
                  index < stepIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <motion.div
          className="lg:col-span-2 card p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {stepIcons[currentStep.id]}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currentStep.title}
                </h2>
              </div>

              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit();
                }}
              >
                {currentStep.prompts.map((prompt) =>
                  prompt.showWhen && !prompt.showWhen(currentDraft)
                    ? null
                    : (
                      <motion.div
                        key={prompt.id.toString()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        {renderModernPrompt(prompt, currentDraft, errors[prompt.id as string], handleDraftChange)}
                      </motion.div>
                    )
                )}

                <div className="flex justify-between items-center pt-6">
                  {stepIndex > 0 && (
                    <motion.button
                      type="button"
                      className="btn-secondary px-6 py-3 flex items-center gap-2"
                      onClick={handleBack}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </motion.button>
                  )}

                  <motion.button
                    type="submit"
                    className="btn-primary px-6 py-3 flex items-center gap-2 ml-auto"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner" />
                        Generating...
                      </>
                    ) : isLastStep ? (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Campaign
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Summary Panel */}
        <motion.aside
          className="card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Campaign Summary
          </h3>
          <div className="space-y-4">
            {Object.entries({
              Goal: summary.goal,
              Audience: summary.audience,
              Length: summary.length ? `${summary.length} steps` : "8 steps (default)",
              Cadence: summary.cadence || "45 days (default)",
              SMS: summary.includeSms ? `Yes (steps ${summary.smsPlacement.join(", ") || "3, 7"})` : "No",
              Emphasize: summary.emphasize,
              Avoid: summary.avoid,
              "A/B Testing": summary.abSubjects ? "Enabled" : "Disabled"
            }).map(([key, value]) => (
              <motion.div
                key={key}
                className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {key}
                </dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">
                  {value || <span className="text-gray-400 dark:text-gray-600">Not set</span>}
                </dd>
              </motion.div>
            ))}
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

const renderModernPrompt = (
  prompt: IntakePrompt,
  draft: IntakeDraft,
  error: string | undefined,
  onChange: (prompt: IntakePrompt, value: string | boolean) => void
) => {
  if (prompt.type === "boolean") {
    const value = draft[prompt.id];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {prompt.label}
        </label>
        {prompt.helper && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{prompt.helper}</p>
        )}
        <div className="flex gap-3">
          <motion.button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              value === true
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => onChange(prompt, true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Yes
          </motion.button>
          <motion.button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              value === false
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => onChange(prompt, false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            No
          </motion.button>
        </div>
        {error && (
          <motion.p
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={prompt.id.toString()} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {prompt.label}
      </label>
      {prompt.helper && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{prompt.helper}</p>
      )}
      <input
        id={prompt.id.toString()}
        type="text"
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        placeholder={prompt.placeholder}
        value={(draft[prompt.id] as string | undefined) ?? ""}
        onChange={(event) => onChange(prompt, event.target.value)}
      />
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
};