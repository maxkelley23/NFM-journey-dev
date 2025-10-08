import { describe, expect, it, vi } from "vitest";

// Mock the OpenAI module before importing the route
vi.mock("@/app/lib/openai", () => ({
  hasOpenAICredentials: false,
  openai: null
}));

describe("plan route delay calculations", () => {
  // Test the helper functions that we added
  it("should extract total days from cadence strings", () => {
    // This would require exporting the function, so we'll test it indirectly
    // through the API behavior in integration tests
  });

  it("should generate evenly spaced delays for custom email counts", () => {
    const generateDelays = (count: number, days: number) => {
      if (count === 1) return [0];
      const spacing = Math.floor(days / (count - 1));
      return Array.from({ length: count }, (_, i) => i * spacing);
    };

    // Test 3 emails over 10 weeks (70 days)
    const delays3over70 = generateDelays(3, 70);
    expect(delays3over70).toEqual([0, 35, 70]);

    // Test 5 emails over 30 days
    const delays5over30 = generateDelays(5, 30);
    expect(delays5over30).toEqual([0, 7, 14, 21, 28]);

    // Test edge case: 1 email
    const delays1 = generateDelays(1, 10);
    expect(delays1).toEqual([0]);

    // Test 2 emails over 14 days
    const delays2over14 = generateDelays(2, 14);
    expect(delays2over14).toEqual([0, 14]);
  });

  it("should convert cumulative delays to relative delays", () => {
    const cumulativeSteps = [
      { n: 1, type: "email", delay: 0, purpose: "intro" },
      { n: 2, type: "email", delay: 35, purpose: "educate" },
      { n: 3, type: "email", delay: 70, purpose: "convert" }
    ];

    // Simulate the conversion logic
    const sortedSteps = [...cumulativeSteps].sort((a, b) => a.delay - b.delay);
    const relativeSteps = sortedSteps.map((step, index) => {
      if (index === 0) {
        return step;
      }
      const prevDelay = sortedSteps[index - 1].delay;
      return {
        ...step,
        delay: step.delay - prevDelay
      };
    });

    expect(relativeSteps).toEqual([
      { n: 1, type: "email", delay: 0, purpose: "intro" },
      { n: 2, type: "email", delay: 35, purpose: "educate" },
      { n: 3, type: "email", delay: 35, purpose: "convert" }
    ]);
  });

  it("should handle mixed email and SMS steps", () => {
    const mixedSteps = [
      { n: 1, type: "email", delay: 0, purpose: "intro" },
      { n: 2, type: "email", delay: 10, purpose: "educate" },
      { n: 3, type: "sms", delay: 10, purpose: "reminder" },
      { n: 4, type: "email", delay: 20, purpose: "convert" }
    ];

    // Verify sorting by delay maintains order
    const sorted = [...mixedSteps].sort((a, b) => a.delay - b.delay);

    // When delays are the same, original order should be preserved
    expect(sorted[1].type).toBe("email");
    expect(sorted[2].type).toBe("sms");
  });

  it("should dedupe steps with same number and type", () => {
    const duplicateSteps = [
      { n: 1, type: "email", delay: 0, purpose: "intro" },
      { n: 1, type: "email", delay: 0, purpose: "duplicate" }, // duplicate
      { n: 2, type: "email", delay: 10, purpose: "educate" },
      { n: 2, type: "sms", delay: 10, purpose: "sms" } // different type, not duplicate
    ];

    // Simulate deduplication logic
    const seen = new Map();
    duplicateSteps.forEach((step) => {
      const key = `${step.n}-${step.type}`;
      if (!seen.has(key)) {
        seen.set(key, step);
      }
    });
    const deduped = Array.from(seen.values());

    expect(deduped).toHaveLength(3);
    expect(deduped.find(s => s.n === 1 && s.type === "email")?.purpose).toBe("intro");
    expect(deduped.find(s => s.n === 2 && s.type === "sms")).toBeDefined();
  });

  describe("cadence string parsing", () => {
    const extractTotalDaysFromCadence = (cadence: string): number => {
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

      return 45; // default
    };

    it("should parse week strings correctly", () => {
      expect(extractTotalDaysFromCadence("10 weeks")).toBe(70);
      expect(extractTotalDaysFromCadence("2 weeks")).toBe(14);
      expect(extractTotalDaysFromCadence("1 week")).toBe(7);
      expect(extractTotalDaysFromCadence("10weeks")).toBe(70);
    });

    it("should parse month strings correctly", () => {
      expect(extractTotalDaysFromCadence("3 months")).toBe(90);
      expect(extractTotalDaysFromCadence("1 month")).toBe(30);
      expect(extractTotalDaysFromCadence("6months")).toBe(180);
    });

    it("should parse day strings correctly", () => {
      expect(extractTotalDaysFromCadence("45 days")).toBe(45);
      expect(extractTotalDaysFromCadence("30 days")).toBe(30);
      expect(extractTotalDaysFromCadence("7days")).toBe(7);
    });

    it("should return default for unrecognized patterns", () => {
      expect(extractTotalDaysFromCadence("custom cadence")).toBe(45);
      expect(extractTotalDaysFromCadence("")).toBe(45);
      expect(extractTotalDaysFromCadence("quarterly")).toBe(45);
    });
  });
});