export const writerPrompt = (
  planJson: string,
  intake: any,
  snippets: string,
  ab: boolean
) => `
Write the campaign content by step. Follow all rules in the system message.

Use the tone snippet patterns below to shape cadence and phrasing (do not copy verbatim):
[SNIPPETS_START]
${snippets}
[SNIPPETS_END]

Audience: ${intake.audience}
Goal: ${intake.goal}
Emphasize: ${intake.emphasize || "-"}
Avoid: ${intake.avoid || "-"}
A/B subjects: ${ab ? "true" : "false"}

For each EMAIL step in the provided plan JSON:
- Output exactly this format:
Step {n} • Email • Delay: {delay}
Preheader:
${ab ? "Subject A:\nSubject B:" : "Subject:"}
Body:

Guidelines:
- Preheader <= 90 chars, sentence case, no emojis/variables.
- ${ab ? "Two subject variants, " : ""}sentence case, no emojis, <=55 chars.
- Body plain text, include {{recipient.f_name}} naturally in the first 1–2 paragraphs; do not include links.
- Value-forward CTA patterns (e.g., "We're here as a resource if you'd like to explore your options...").
- Never quote specific rates/APR or imply guarantees/approvals.
Plan JSON:
${planJson}
`;
