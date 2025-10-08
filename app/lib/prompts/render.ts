export type RenderableStep = {
  n: number;
  type: "email";
  delay: number;
  preheader: string;
  subjects: string[];
  body: string;
};

export const renderCampaign = (steps: RenderableStep[]) =>
  steps
    .map((step) => renderEmailStep(step))
    .join("\n\n")
    .trim();

const renderEmailStep = (step: RenderableStep) => {
  const subjectLines = step.subjects.length > 1
    ? `Subject A: ${step.subjects[0] ?? ""}\nSubject B: ${step.subjects[1] ?? ""}`
    : `Subject: ${step.subjects[0] ?? ""}`;

  return [
    `Step ${step.n} • Email • Delay: ${step.delay}`,
    `Preheader: ${step.preheader}`,
    subjectLines,
    `Body:\n${step.body.trim()}`
  ].join("\n");
};
