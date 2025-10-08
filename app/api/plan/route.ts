import { NextResponse } from "next/server";
import { z } from "zod";
import { hasOpenAICredentials, openai } from "@/app/lib/openai";
import { SYSTEM_PROMPT } from "@/app/lib/prompts/system";
import { plannerPrompt } from "@/app/lib/prompts/planner";
import { DEFAULT_DELAYS, DEFAULT_SMS_STEPS } from "@/app/lib/catalog/rules";
import {
  IntakePayload,
  intakePayloadSchema
} from "@/app/lib/schemas/intake";

const planSchema = z.object({
  steps: z.array(
    z.object({
      n: z.number().int().positive(),
      type: z.enum(["email", "sms"]),
      delay: z.number().int().min(0),
      purpose: z.string().min(2)
    })
  )
});

const DEFAULT_PURPOSES = [
  "set-expectations",
  "deliver-value",
  "ask-for-reply",
  "educate",
  "social-proof",
  "objection-handoff",
  "value-recap",
  "direct-invite"
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = z.object({ intake: intakePayloadSchema }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid intake provided." },
      { status: 400 }
    );
  }

  const { intake } = parsed.data;
  const normalizedIntake = {
    ...intake,
    smsPlacement: intake.includeSms
      ? dedupeNumbers(intake.smsPlacement.length ? intake.smsPlacement : DEFAULT_SMS_STEPS)
      : []
  };

  let plan = await fetchPlanFromOpenAI(normalizedIntake);
  if (!plan) {
    plan = fallbackPlan(normalizedIntake);
  }

  return NextResponse.json(plan);
}

async function fetchPlanFromOpenAI(intake: IntakePayload) {
  if (!hasOpenAICredentials) {
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: plannerPrompt(intake)
        }
      ]
    });

    const output = response.choices[0]?.message?.content ?? "";
    const candidate = JSON.parse(output);
    const parsedPlan = planSchema.safeParse(candidate);
    if (!parsedPlan.success) {
      return null;
    }

    return {
      steps: normalizePlanSteps(parsedPlan.data.steps, intake)
    };
  } catch (error) {
    console.error("Failed to generate plan:", error);
    return null;
  }
}

// Helper function to extract total days from cadence string
function extractTotalDaysFromCadence(cadence: string): number {
  // Look for patterns like "10 weeks", "3 months", "45 days", etc.
  const weekMatch = cadence.match(/(\d+)\s*week/i);
  if (weekMatch) {
    return parseInt(weekMatch[1]) * 7;
  }

  const monthMatch = cadence.match(/(\d+)\s*month/i);
  if (monthMatch) {
    return parseInt(monthMatch[1]) * 30;
  }

  const dayMatch = cadence.match(/(\d+)\s*day/i);
  if (dayMatch) {
    return parseInt(dayMatch[1]);
  }

  // Default to 45 days if pattern not recognized
  return 45;
}

function fallbackPlan(intake: IntakePayload) {
  // Use the specified length or default to 8
  const emailCount = intake.length || 8;
  const totalDays = intake.cadence ? extractTotalDaysFromCadence(intake.cadence) : 45;

  // Generate delays that spread emails evenly across the timeframe
  const generateDelays = (count: number, days: number) => {
    if (count === 1) return [0];
    const spacing = Math.floor(days / (count - 1));
    return Array.from({ length: count }, (_, i) => i * spacing);
  };

  const delays = emailCount <= 8
    ? DEFAULT_DELAYS.slice(0, emailCount)
    : generateDelays(emailCount, totalDays);

  const baseSteps = delays.map((delay, index) => ({
    n: index + 1,
    type: "email" as const,
    delay,
    purpose: DEFAULT_PURPOSES[index] ?? "nurture"
  }));

  if (!intake.includeSms) {
    return { steps: baseSteps };
  }

  const smsSteps = intake.smsPlacement
    .map((stepNumber) => {
      const base = baseSteps.find((item) => item.n === stepNumber);
      return base
        ? {
            n: stepNumber,
            type: "sms" as const,
            delay: base.delay,
            purpose: `${base.purpose}-sms`
          }
        : null;
    })
    .filter(Boolean) as Array<{
      n: number;
      type: "sms";
      delay: number;
      purpose: string;
    }>;

  const combined = [...baseSteps, ...smsSteps].sort((a, b) => a.n - b.n);
  return { steps: combined };
}

function normalizePlanSteps(steps: z.infer<typeof planSchema>["steps"], intake: IntakePayload) {
  const emails = steps.filter((step) => step.type === "email");
  if (!emails.length) {
    return fallbackPlan(intake).steps;
  }

  // Convert cumulative delays to relative delays
  const sortedSteps = steps.sort((a, b) => a.delay - b.delay);
  const relativeSteps = sortedSteps.map((step, index) => {
    if (index === 0) {
      return step; // First step keeps its delay (should be 0 or 1)
    }
    // Calculate relative delay from previous step
    const prevDelay = sortedSteps[index - 1].delay;
    return {
      ...step,
      delay: step.delay - prevDelay
    };
  });

  const deduped = dedupeSteps(relativeSteps);
  return deduped.sort((a, b) => a.n - b.n);
}

function dedupeSteps(
  steps: Array<{ n: number; type: string } & Record<string, unknown>>
) {
  const seen = new Map<string, Record<string, unknown>>();
  steps.forEach((step) => {
    const key = `${step.n}-${step.type}`;
    if (!seen.has(key)) {
      seen.set(key, step);
    }
  });
  return Array.from(seen.values()) as Array<{
    n: number;
    type: "email" | "sms";
    delay: number;
    purpose: string;
  }>;
}

function dedupeNumbers(values: number[]) {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}
