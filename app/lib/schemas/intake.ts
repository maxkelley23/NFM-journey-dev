import { z } from "zod";
import { DEFAULT_SMS_STEPS } from "../catalog/rules";

export const intakePayloadSchema = z.object({
  goal: z.string().min(3),
  audience: z.string().min(3),
  length: z.number().int().positive().max(30).nullable(),
  cadence: z.string().min(2).max(120).nullable(),
  includeSms: z.boolean(),
  smsPlacement: z.array(z.number().int().positive()).default(DEFAULT_SMS_STEPS),
  emphasize: z.string().optional().default(""),
  avoid: z.string().optional().default(""),
  abSubjects: z.boolean()
});

export type IntakePayload = z.infer<typeof intakePayloadSchema>;
