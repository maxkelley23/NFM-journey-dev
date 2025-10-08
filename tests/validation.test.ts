import { describe, expect, it } from "vitest";
import { validateCampaignOutput } from "@/app/lib/campaign/validation";

const SAMPLE = `Step 1 • Email • Delay: 1
Preheader: Welcome to the process
Subject A: Let's map out your next steps
Subject B: Map out your next steps together
Body:
Hi {{recipient.f_name}},

We're here to outline what the next few weeks will look like and answer questions along the way.

Step 2 • Email • Delay: 4
Preheader: Keep exploring at your pace
Subject A: You're free to explore at your pace
Subject B: Explore each option at your pace
Body:
Hi {{recipient.f_name}},

Here's a quick way to think about what comes next so you can move forward when the time is right.`;

describe("campaign validation", () => {
  it("accepts well-formed output", () => {
    const result = validateCampaignOutput(SAMPLE, {
      abSubjects: true,
      expectedSteps: 2
    });
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("flags long subjects", () => {
    const invalid = SAMPLE.replace(
      "Subject A: Let's map out your next steps",
      "Subject A: This subject line is definitely going to be way too long to pass compliance"
    );
    const result = validateCampaignOutput(invalid, { abSubjects: true });
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.field === "subject")).toBe(true);
  });

  it("requires merge field in body", () => {
    const invalid = SAMPLE.replace("Hi {{recipient.f_name}},", "Hi there,");
    const result = validateCampaignOutput(invalid, { abSubjects: true });
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.field === "body")).toBe(true);
  });
});
