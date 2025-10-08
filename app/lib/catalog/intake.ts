import { z } from "zod";
import { DEFAULT_SMS_STEPS } from "./rules";

export type IntakeAnswers = {
  goal: string;
  audience: string;
  length: number | null;
  cadence: string | null;
  includeSms: boolean;
  smsPlacement: number[];
  emphasize: string;
  avoid: string;
  abSubjects: boolean;
};

export type IntakeDraft = Partial<IntakeAnswers> & {
  lengthNotes?: string;
  cadenceNotes?: string;
  smsPlacementNotes?: string;
};

export type PromptType = "text" | "boolean";

export type IntakePrompt = {
  id: keyof IntakeDraft | "lengthNotes" | "cadenceNotes" | "smsPlacementNotes";
  label: string;
  placeholder?: string;
  helper?: string;
  type: PromptType;
  optional?: boolean;
  showWhen?: (draft: IntakeDraft) => boolean;
};

export interface IntakeStep {
  id: string;
  title: string;
  prompts: IntakePrompt[];
  validate: (draft: IntakeDraft) => StepValidationResult;
}

export interface StepValidationResult {
  success: boolean;
  errors?: Record<string, string>;
  values?: Partial<IntakeAnswers>;
  draft?: IntakeDraft;
}

export const DEFAULT_ANSWERS: IntakeAnswers = {
  goal: "",
  audience: "",
  length: null,
  cadence: null,
  includeSms: false,
  smsPlacement: DEFAULT_SMS_STEPS,
  emphasize: "",
  avoid: "",
  abSubjects: true
};

const textField = z
  .string({ required_error: "This field is required." })
  .transform((value) => value.trim())
  .pipe(z.string().min(3, "Please add a bit more detail."));

const optionalTextField = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .transform((value) => value ?? "");

const decideRegex = /decide\s*for\s*me/i;

const lengthCadenceSchema = z
  .object({
    lengthNotes: z
      .string({ required_error: "Please share a length preference or say 'decide for me'." })
      .transform((value) => value.trim()),
    cadenceNotes: z
      .string({ required_error: "Please share a cadence preference or say 'decide for me'." })
      .transform((value) => value.trim())
  })
  .transform(({ lengthNotes, cadenceNotes }) => {
    const wantsDefault =
      decideRegex.test(lengthNotes) || decideRegex.test(cadenceNotes);
    if (wantsDefault) {
      return {
        length: null,
        cadence: "balanced",
        lengthNotes,
        cadenceNotes
      };
    }

    const length = extractFirstNumber(lengthNotes);
    const cadence = cadenceNotes.length ? cadenceNotes : null;

    return {
      length: length ?? null,
      cadence,
      lengthNotes,
      cadenceNotes
    };
  });

const smsSchema = z
  .object({
    includeSms: z.boolean({ required_error: "Please choose yes or no." }),
    smsPlacementNotes: z.string().optional()
  })
  .transform(({ includeSms, smsPlacementNotes }) => {
    if (!includeSms) {
      return {
        includeSms: false,
        smsPlacement: DEFAULT_SMS_STEPS,
        smsPlacementNotes
      };
    }

    const placements = parseSmsPlacement(smsPlacementNotes);
    return {
      includeSms: true,
      smsPlacement: placements.length ? placements : DEFAULT_SMS_STEPS,
      smsPlacementNotes
    };
  });

const emphasizeAvoidSchema = z.object({
  emphasize: optionalTextField,
  avoid: optionalTextField
});

const abSchema = z.object({
  abSubjects: z.boolean({ required_error: "Let us know if you want A/B subjects." })
});

export const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "goal",
    title: "Campaign goal",
    prompts: [
      {
        id: "goal",
        label: "What's the main goal for this campaign?",
        placeholder: "e.g. Nurture new purchase leads toward application",
        type: "text"
      }
    ],
    validate: (draft) => {
      const result = z
        .object({ goal: textField })
        .safeParse({ goal: draft.goal ?? "" });
      if (!result.success) {
        return {
          success: false,
          errors: {
            goal: result.error.issues[0]?.message ?? "Please add the campaign goal."
          }
        };
      }

      return {
        success: true,
        values: { goal: result.data.goal }
      };
    }
  },
  {
    id: "audience",
    title: "Audience",
    prompts: [
      {
        id: "audience",
        label: "Who are we speaking to?",
        placeholder: "e.g. First-time buyers in Massachusetts",
        type: "text"
      }
    ],
    validate: (draft) => {
      const result = z
        .object({ audience: textField })
        .safeParse({ audience: draft.audience ?? "" });
      if (!result.success) {
        return {
          success: false,
          errors: {
            audience:
              result.error.issues[0]?.message ?? "Please describe the audience."
          }
        };
      }

      return {
        success: true,
        values: { audience: result.data.audience }
      };
    }
  },
  {
    id: "lengthCadence",
    title: "Cadence preference",
    prompts: [
      {
        id: "lengthNotes",
        label:
          "How many touches would you like? (type 'decide for me' for defaults)",
        placeholder: "e.g. 6 emails or decide for me",
        type: "text"
      },
      {
        id: "cadenceNotes",
        label:
          "Any cadence notes? (spacing, pacing, etc. or 'decide for me')",
        placeholder: "e.g. front-loaded, monthly, decide for me",
        type: "text"
      }
    ],
    validate: (draft) => {
      const result = lengthCadenceSchema.safeParse({
        lengthNotes: draft.lengthNotes ?? "",
        cadenceNotes: draft.cadenceNotes ?? ""
      });

      if (!result.success) {
        return {
          success: false,
          errors: {
            lengthNotes:
              "Please share a length preference or let us decide for you.",
            cadenceNotes:
              "Please share a cadence preference or let us decide for you."
          }
        };
      }

      const { length, cadence, lengthNotes, cadenceNotes } = result.data;
      return {
        success: true,
        values: { length, cadence },
        draft: { lengthNotes, cadenceNotes }
      };
    }
  },
  {
    id: "sms",
    title: "SMS inclusion",
    prompts: [
      {
        id: "includeSms",
        label: "Include SMS touchpoints?",
        helper: "If yes, we'll default to steps 3 & 7 unless you adjust below.",
        type: "boolean"
      },
      {
        id: "smsPlacementNotes",
        label: "Preferred SMS steps (comma separated)",
        placeholder: "e.g. 2, 6",
        type: "text",
        optional: true,
        showWhen: (draft) => draft.includeSms === true
      }
    ],
    validate: (draft) => {
      const result = smsSchema.safeParse({
        includeSms: draft.includeSms,
        smsPlacementNotes: draft.smsPlacementNotes
      });

      if (!result.success) {
        return {
          success: false,
          errors: {
            includeSms: "Please choose yes or no."
          }
        };
      }

      const { includeSms, smsPlacement, smsPlacementNotes } = result.data;
      return {
        success: true,
        values: { includeSms, smsPlacement },
        draft: { smsPlacementNotes }
      };
    }
  },
  {
    id: "topics",
    title: "Topics",
    prompts: [
      {
        id: "emphasize",
        label: "Any topics to emphasize?",
        placeholder: "e.g. education on pre-approval basics",
        type: "text",
        optional: true
      },
      {
        id: "avoid",
        label: "Anything to avoid mentioning?",
        placeholder: "e.g. renovation loans",
        type: "text",
        optional: true
      }
    ],
    validate: (draft) => {
      const result = emphasizeAvoidSchema.safeParse({
        emphasize: draft.emphasize ?? "",
        avoid: draft.avoid ?? ""
      });

      if (!result.success) {
        return {
          success: false,
          errors: {}
        };
      }

      return {
        success: true,
        values: result.data
      };
    }
  },
  {
    id: "abSubjects",
    title: "Subject testing",
    prompts: [
      {
        id: "abSubjects",
        label: "Do you want A/B subject lines?",
        type: "boolean"
      }
    ],
    validate: (draft) => {
      const result = abSchema.safeParse({
        abSubjects: draft.abSubjects
      });

      if (!result.success) {
        return {
          success: false,
          errors: {
            abSubjects: "Please choose yes or no."
          }
        };
      }

      return {
        success: true,
        values: { abSubjects: result.data.abSubjects }
      };
    }
  }
];

export const isFlowComplete = (answers: IntakeAnswers) =>
  answers.goal.length > 0 && answers.audience.length > 0;

export const toApiIntake = (answers: IntakeAnswers) => ({
  goal: answers.goal,
  audience: answers.audience,
  length: answers.length,
  cadence: answers.cadence,
  includeSms: answers.includeSms,
  smsPlacement: answers.smsPlacement.length
    ? answers.smsPlacement
    : DEFAULT_SMS_STEPS,
  emphasize: answers.emphasize,
  avoid: answers.avoid,
  abSubjects: answers.abSubjects
});

function extractFirstNumber(input: string): number | null {
  const match = input.match(/\d+/);
  if (!match) return null;
  const value = Number.parseInt(match[0] ?? "", 10);
  return Number.isNaN(value) ? null : value;
}

function parseSmsPlacement(notes?: string) {
  if (!notes) return [];
  return notes
    .split(",")
    .map((token) => Number.parseInt(token.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => a - b);
}
