import { describe, expect, it } from "vitest";
import { plannerPrompt } from "@/app/lib/prompts/planner";

describe("plannerPrompt", () => {
  it("should correctly extract email count from intake.length", () => {
    const intake = {
      goal: "Convert leads",
      audience: "First-time home buyers",
      length: 3,
      cadence: "10 weeks",
      includeSms: false,
      smsPlacement: [],
      emphasize: "",
      avoid: ""
    };

    const prompt = plannerPrompt(intake);

    expect(prompt).toContain("Generate EXACTLY 3 email steps");
    expect(prompt).toContain("Distribute these 3 emails over 70 days total");
    expect(prompt).toContain("space them approximately 35 days apart");
  });

  it("should handle different cadence formats", () => {
    const testCases = [
      { cadence: "10 weeks", expectedDays: 70 },
      { cadence: "3 months", expectedDays: 90 },
      { cadence: "45 days", expectedDays: 45 },
      { cadence: "2 weeks", expectedDays: 14 }
    ];

    testCases.forEach(({ cadence, expectedDays }) => {
      const intake = {
        goal: "Convert leads",
        audience: "First-time home buyers",
        length: 5,
        cadence,
        includeSms: false,
        smsPlacement: [],
        emphasize: "",
        avoid: ""
      };

      const prompt = plannerPrompt(intake);
      expect(prompt).toContain(`over ${expectedDays} days total`);
    });
  });

  it("should use default 8 emails when length is null", () => {
    const intake = {
      goal: "Convert leads",
      audience: "First-time home buyers",
      length: null,
      cadence: "45 days",
      includeSms: false,
      smsPlacement: [],
      emphasize: "",
      avoid: ""
    };

    const prompt = plannerPrompt(intake);
    expect(prompt).toContain("Generate EXACTLY 8 email steps");
  });

  it("should include SMS placement when specified", () => {
    const intake = {
      goal: "Convert leads",
      audience: "First-time home buyers",
      length: 8,
      cadence: "45 days",
      includeSms: true,
      smsPlacement: [3, 7],
      emphasize: "",
      avoid: ""
    };

    const prompt = plannerPrompt(intake);
    expect(prompt).toContain("Include SMS at steps 3 and 7");
  });

  it("should include audience and goal in the prompt", () => {
    const intake = {
      goal: "Generate buyer leads in Massachusetts",
      audience: "MA first-time home buyers",
      length: 5,
      cadence: "30 days",
      includeSms: false,
      smsPlacement: [],
      emphasize: "local market knowledge",
      avoid: "generic advice"
    };

    const prompt = plannerPrompt(intake);
    expect(prompt).toContain("The audience is: MA first-time home buyers");
    expect(prompt).toContain("The goal is: Generate buyer leads in Massachusetts");
    expect(prompt).toContain("Emphasize: local market knowledge");
    expect(prompt).toContain("Avoid: generic advice");
  });

  it("should calculate spacing correctly for edge cases", () => {
    const intake = {
      goal: "Convert leads",
      audience: "Home buyers",
      length: 1,
      cadence: "10 days",
      includeSms: false,
      smsPlacement: [],
      emphasize: "",
      avoid: ""
    };

    const prompt = plannerPrompt(intake);
    expect(prompt).toContain("Generate EXACTLY 1 email steps");
    // Single email doesn't need spacing calculation
    expect(prompt).toContain("over 10 days total");
  });
});