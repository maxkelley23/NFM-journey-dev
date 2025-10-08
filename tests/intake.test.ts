import { describe, expect, it } from "vitest";
import {
  DEFAULT_ANSWERS,
  INTAKE_STEPS,
  IntakeDraft,
  toApiIntake
} from "@/app/lib/catalog/intake";
import { DEFAULT_SMS_STEPS } from "@/app/lib/catalog/rules";

describe("intake flow", () => {
  it("asks exactly six steps", () => {
    expect(INTAKE_STEPS).toHaveLength(6);
    expect(INTAKE_STEPS.map((step) => step.id)).toEqual([
      "goal",
      "audience",
      "lengthCadence",
      "sms",
      "topics",
      "abSubjects"
    ]);
  });

  it("defaults to 8/45 cadence when user says decide for me", () => {
    const step = INTAKE_STEPS.find((item) => item.id === "lengthCadence");
    expect(step).toBeDefined();
    const result = step!.validate({
      lengthNotes: "Decide for me",
      cadenceNotes: "decide for me"
    });
    expect(result.success).toBe(true);
    expect(result.values).toEqual({
      length: null,
      cadence: "balanced"
    });
  });

  it("respects SMS defaults and placements", () => {
    const step = INTAKE_STEPS.find((item) => item.id === "sms");
    expect(step).toBeDefined();

    const denied = step!.validate({ includeSms: false } as IntakeDraft);
    expect(denied.success).toBe(true);
    expect(denied.values).toEqual({
      includeSms: false,
      smsPlacement: DEFAULT_SMS_STEPS
    });

    const accepted = step!.validate({
      includeSms: true,
      smsPlacementNotes: "2, 6"
    });
    expect(accepted.success).toBe(true);
    expect(accepted.values?.smsPlacement).toEqual([2, 6]);
  });

  it("produces API intake payload", () => {
    const payload = toApiIntake({
      ...DEFAULT_ANSWERS,
      goal: "Warm leads toward application",
      audience: "First-time buyers in MA",
      includeSms: true,
      smsPlacement: [2, 5],
      abSubjects: false
    });

    expect(payload).toMatchObject({
      goal: "Warm leads toward application",
      audience: "First-time buyers in MA",
      includeSms: true,
      smsPlacement: [2, 5],
      abSubjects: false
    });
  });
});
