// Helper function to extract location from audience string
function extractLocation(audience: string): string | null {
  // Common state abbreviations and full names
  const statePatterns = [
    /\b(MA|Massachusetts)\b/i,
    /\b(NY|New York)\b/i,
    /\b(CA|California)\b/i,
    /\b(TX|Texas)\b/i,
    /\b(FL|Florida)\b/i,
    // Add more states as needed
  ];

  // Check for state abbreviations or names
  for (const pattern of statePatterns) {
    const match = audience.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // Check for city names (common major cities)
  const cityPatterns = [
    /\b(Boston|Cambridge|Worcester|Springfield)\b/i,
    /\b(New York City|NYC|Manhattan|Brooklyn)\b/i,
    /\b(Los Angeles|San Francisco|San Diego)\b/i,
    /\b(Houston|Dallas|Austin|San Antonio)\b/i,
    /\b(Miami|Orlando|Tampa)\b/i,
    // Add more cities as needed
  ];

  for (const pattern of cityPatterns) {
    const match = audience.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // Generic location extraction (looks for patterns like "in [Location]" or "[Location] home buyers")
  const genericMatch = audience.match(/(?:in|from|around|near)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:home|house|property|real estate)|,|\.|$)/i);
  if (genericMatch) {
    return genericMatch[1].trim();
  }

  const locationFirstMatch = audience.match(/^([A-Z][a-zA-Z\s]+?)\s+(?:home|house|property|real estate|first[- ]time)/i);
  if (locationFirstMatch) {
    return locationFirstMatch[1].trim();
  }

  return null;
}

export const writerPrompt = (
  planJson: string,
  intake: any,
  snippets: string,
  ab: boolean
) => {
  // Extract location information from audience string
  const locationInfo = extractLocation(intake.audience);

  return `
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

${locationInfo ? `LOCATION-SPECIFIC REQUIREMENTS:
- This campaign is specifically for ${locationInfo} home buyers
- Include location-relevant content (e.g., "${locationInfo} housing market", "homes in ${locationInfo}", "${locationInfo} neighborhoods")
- Reference local market conditions when appropriate
- Make the content feel tailored to ${locationInfo} residents` : ''}

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
${locationInfo ? `- Include location-specific references naturally throughout the campaign` : ''}
Plan JSON:
${planJson}
`;
};
