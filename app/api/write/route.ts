import { NextResponse } from "next/server";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/app/lib/prompts/system";
import { writerPrompt } from "@/app/lib/prompts/writer";
import { hasOpenAICredentials, openai } from "@/app/lib/openai";
import { intakePayloadSchema } from "@/app/lib/schemas/intake";
import { validateCampaignOutput } from "@/app/lib/campaign/validation";

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

const toneSnippetSchema = z.object({
  text: z.string().min(6),
  audiences: z.array(z.string()).default(["general"]),
  purposes: z.array(z.string()).default(["general"])
});

const requestSchema = z.object({
  intake: intakePayloadSchema,
  plan: planSchema,
  toneSnippets: z.array(toneSnippetSchema).min(1),
  abSubjects: z.boolean()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.format() },
      { status: 400 }
    );
  }

  if (!hasOpenAICredentials) {
    return NextResponse.json(
      { error: "Missing OpenAI credentials." },
      { status: 500 }
    );
  }

  const { intake, plan, toneSnippets, abSubjects } = parsed.data;
  const snippetText = serializeSnippets(toneSnippets);
  const planJson = JSON.stringify(plan, null, 2);

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      temperature: 0.6,
      input: [
        {
          role: "system",
          content: [{ type: "text", text: SYSTEM_PROMPT }]
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: writerPrompt(planJson, intake, snippetText, abSubjects)
            }
          ]
        }
      ]
    });

    const text = response.output_text?.trim() ?? "";
    const validation = validateCampaignOutput(text, {
      abSubjects,
      expectedSteps: plan.steps.filter((step) => step.type === "email").length
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Generated content failed validation.",
          issues: validation.issues
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Failed to generate campaign copy:", error);
    return NextResponse.json(
      { error: "Failed to generate campaign copy." },
      { status: 500 }
    );
  }
}

const serializeSnippets = (
  snippets: Array<z.infer<typeof toneSnippetSchema>>
) =>
  snippets
    .map(
      (snippet, index) =>
        `${index + 1}. "${snippet.text}" (audiences: ${snippet.audiences.join(
          ", "
        )}; purposes: ${snippet.purposes.join(", ")})`
    )
    .join("\n");
