import { BANNED_PATTERNS, PREHEADER_MAX, SUBJECT_MAX } from "@/app/lib/catalog/rules";

export type CampaignValidationIssue = {
  step?: number;
  field?: "preheader" | "subject" | "body" | "format" | "compliance";
  message: string;
};

export type CampaignValidationResult = {
  isValid: boolean;
  issues: CampaignValidationIssue[];
};

export const validateCampaignOutput = (
  text: string,
  options: { abSubjects: boolean; expectedSteps?: number } = { abSubjects: true }
): CampaignValidationResult => {
  const issues: CampaignValidationIssue[] = [];
  const blocks = splitBlocks(text);

  if (blocks.length === 0) {
    issues.push({
      field: "format",
      message: "Campaign output appears to be empty."
    });
    return { isValid: false, issues };
  }

  if (options.expectedSteps && blocks.length !== options.expectedSteps) {
    issues.push({
      field: "format",
      message: `Expected ${options.expectedSteps} steps, received ${blocks.length}.`
    });
  }

  blocks.forEach((block) => {
    const { stepNumber, delay, preheader, subjects, body } = block;
    if (stepNumber == null || delay == null) {
      issues.push({
        field: "format",
        message: "Each block must start with 'Step N • Email • Delay: X'."
      });
      return;
    }

    if (!preheader) {
      issues.push({
        step: stepNumber,
        field: "preheader",
        message: "Missing preheader line."
      });
    } else {
      const value = stripLabel(preheader, "Preheader:");
      if (!value.length) {
        issues.push({
          step: stepNumber,
          field: "preheader",
          message: "Preheader cannot be empty."
        });
      }
      if (value.length > PREHEADER_MAX) {
        issues.push({
          step: stepNumber,
          field: "preheader",
          message: `Preheader exceeds ${PREHEADER_MAX} characters.`
        });
      }
      if (containsEmoji(value)) {
        issues.push({
          step: stepNumber,
          field: "preheader",
          message: "Preheader must not contain emojis."
        });
      }
      if (value.includes("{{recipient.f_name}}")) {
        issues.push({
          step: stepNumber,
          field: "preheader",
          message: "Preheader must not contain merge variables."
        });
      }
    }

    if (!subjects.length) {
      issues.push({
        step: stepNumber,
        field: "subject",
        message: "Missing subject line."
      });
    } else {
      if (options.abSubjects && subjects.length !== 2) {
        issues.push({
          step: stepNumber,
          field: "subject",
          message: "Expected two subject variants (A/B)."
        });
      }
      if (!options.abSubjects && subjects.length !== 1) {
        issues.push({
          step: stepNumber,
          field: "subject",
          message: "Expected a single subject line."
        });
      }

      subjects.forEach((subject) => {
        const label = options.abSubjects ? subject.label : "Subject";
        const textValue = stripLabel(subject.line, label + ":");
        if (!textValue.length) {
          issues.push({
            step: stepNumber,
            field: "subject",
            message: `${label} cannot be empty.`
          });
        }
        if (textValue.length > SUBJECT_MAX) {
          issues.push({
            step: stepNumber,
            field: "subject",
            message: `${label} exceeds ${SUBJECT_MAX} characters.`
          });
        }
        if (containsEmoji(textValue)) {
          issues.push({
            step: stepNumber,
            field: "subject",
            message: `${label} must not contain emojis.`
          });
        }
      });
    }

    if (!body) {
      issues.push({
        step: stepNumber,
        field: "body",
        message: "Missing body copy."
      });
    } else {
      const bodyText = body.replace(/^Body:\s*/i, "");
      if (!bodyText.includes("{{recipient.f_name}}")) {
        issues.push({
          step: stepNumber,
          field: "body",
          message: "Body must include {{recipient.f_name}}."
        });
      }
      if (/https?:\/\//i.test(bodyText)) {
        issues.push({
          step: stepNumber,
          field: "body",
          message: "Body must not include links."
        });
      }
    }
  });

  BANNED_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) {
      issues.push({
        field: "compliance",
        message: `Output failed compliance check for pattern ${pattern}.`
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues
  };
};

type ParsedBlock = {
  stepNumber: number | null;
  delay: number | null;
  preheader?: string;
  subjects: Array<{ label: string; line: string }>;
  body?: string;
};

const splitBlocks = (text: string): ParsedBlock[] => {
  const blocks: ParsedBlock[] = [];
  const rawBlocks = text
    .trim()
    .split(/\n{2,}(?=Step \d+\s*•\s*Email)/)
    .map((block) => block.trim())
    .filter(Boolean);

  rawBlocks.forEach((block) => {
    const lines = block.split("\n");
    const header = lines[0] ?? "";
    const match = header.match(/Step\s+(\d+)\s*•\s*Email\s*•\s*Delay:\s*(\d+)/i);
    const stepNumber = match ? Number.parseInt(match[1] ?? "", 10) : null;
    const delay = match ? Number.parseInt(match[2] ?? "", 10) : null;

    const preheaderLine = lines.find((line) => line.trim().startsWith("Preheader:"));
    const subjectLines = lines
      .filter((line) => /^Subject(\s+[AB])?:/i.test(line.trim()))
      .map((line) => {
        const labelMatch = line.match(/^Subject\s+([AB]):/i);
        const label = labelMatch ? `Subject ${labelMatch[1].toUpperCase()}` : "Subject";
        return { label, line };
      });

    const bodyIndex = lines.findIndex((line) => line.trim().toLowerCase().startsWith("body:"));
    const body =
      bodyIndex >= 0
        ? lines.slice(bodyIndex).join("\n")
        : undefined;

    blocks.push({
      stepNumber,
      delay,
      preheader: preheaderLine,
      subjects: subjectLines,
      body
    });
  });

  return blocks;
};

const stripLabel = (line: string, label: string) =>
  line.replace(label, "").trim();

const containsEmoji = (value: string) =>
  /\p{Extended_Pictographic}/u.test(value);
