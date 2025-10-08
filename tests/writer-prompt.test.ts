import { describe, expect, it } from "vitest";
import { writerPrompt } from "@/app/lib/prompts/writer";

describe("writerPrompt location extraction", () => {
  const mockPlanJson = JSON.stringify({
    steps: [
      { n: 1, type: "email", delay: 0, purpose: "introduction" },
      { n: 2, type: "email", delay: 35, purpose: "education" },
      { n: 3, type: "email", delay: 70, purpose: "conversion" }
    ]
  });

  const mockSnippets = "1. \"Test snippet\" (audiences: general; purposes: general)";

  it("should extract and include MA location in requirements", () => {
    const intake = {
      goal: "Generate leads",
      audience: "MA first-time home buyers",
      emphasize: "",
      avoid: ""
    };

    const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, false);

    expect(prompt).toContain("LOCATION-SPECIFIC REQUIREMENTS:");
    expect(prompt).toContain("This campaign is specifically for MA home buyers");
    expect(prompt).toContain("MA housing market");
    expect(prompt).toContain("homes in MA");
    expect(prompt).toContain("MA neighborhoods");
  });

  it("should extract Massachusetts when spelled out", () => {
    const intake = {
      goal: "Generate leads",
      audience: "Massachusetts home buyers",
      emphasize: "",
      avoid: ""
    };

    const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, false);

    expect(prompt).toContain("LOCATION-SPECIFIC REQUIREMENTS:");
    expect(prompt).toContain("Massachusetts home buyers");
  });

  it("should extract city names like Boston", () => {
    const intake = {
      goal: "Generate leads",
      audience: "Boston area first-time buyers",
      emphasize: "",
      avoid: ""
    };

    const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, false);

    expect(prompt).toContain("LOCATION-SPECIFIC REQUIREMENTS:");
    expect(prompt).toContain("Boston home buyers");
    expect(prompt).toContain("Boston housing market");
  });

  it("should handle multiple state formats", () => {
    const testCases = [
      { audience: "NY home buyers", expected: "NY" },
      { audience: "New York first-time buyers", expected: "New York" },
      { audience: "California real estate investors", expected: "California" },
      { audience: "TX property seekers", expected: "TX" },
      { audience: "Florida home buyers", expected: "Florida" }
    ];

    testCases.forEach(({ audience, expected }) => {
      const intake = {
        goal: "Generate leads",
        audience,
        emphasize: "",
        avoid: ""
      };

      const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, false);
      expect(prompt).toContain(`${expected} home buyers`);
    });
  });

  it("should not include location requirements when no location is detected", () => {
    const intake = {
      goal: "Generate leads",
      audience: "First-time home buyers",
      emphasize: "",
      avoid: ""
    };

    const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, false);

    expect(prompt).not.toContain("LOCATION-SPECIFIC REQUIREMENTS:");
  });

  it("should handle generic location patterns", () => {
    const testCases = [
      { audience: "Home buyers in Springfield", expected: "Springfield" },
      { audience: "Investors from Miami", expected: "Miami" },
      { audience: "Buyers near Houston", expected: "Houston" }
    ];

    testCases.forEach(({ audience, expected }) => {
      const intake = {
        goal: "Generate leads",
        audience,
        emphasize: "",
        avoid: ""
      };

      const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, false);
      expect(prompt).toContain(`${expected} home buyers`);
    });
  });

  it("should include A/B subject line format when requested", () => {
    const intake = {
      goal: "Generate leads",
      audience: "MA home buyers",
      emphasize: "",
      avoid: ""
    };

    const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, true);

    expect(prompt).toContain("Subject A:");
    expect(prompt).toContain("Subject B:");
    expect(prompt).toContain("Two subject variants");
  });

  it("should include emphasis and avoid parameters", () => {
    const intake = {
      goal: "Generate leads",
      audience: "MA home buyers",
      emphasize: "local expertise, market trends",
      avoid: "generic advice, pushy sales tactics"
    };

    const prompt = writerPrompt(mockPlanJson, intake, mockSnippets, false);

    expect(prompt).toContain("Emphasize: local expertise, market trends");
    expect(prompt).toContain("Avoid: generic advice, pushy sales tactics");
  });
});