export const plannerPrompt = (intake: any) => {
  // Extract campaign length and timeframe from the intake
  const emailCount = intake.length || 8; // Use specified length or default to 8
  const totalDays = intake.cadence ? extractTotalDays(intake.cadence) : 45;

  return `
Plan an email${intake.includeSms ? " + SMS" : ""} campaign given the intake below.

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY ${emailCount} email steps (no more, no less)
2. Distribute these ${emailCount} emails over ${totalDays} days total
3. Calculate delays to spread emails evenly across the ${totalDays}-day period
4. The audience is: ${intake.audience}
5. The goal is: ${intake.goal}
${intake.emphasize ? `6. Emphasize: ${intake.emphasize}` : ''}
${intake.avoid ? `7. Avoid: ${intake.avoid}` : ''}

${intake.includeSms ? `Include SMS at steps ${intake.smsPlacement?.join(' and ') || '3 and 7'}.` : ''}

Delays are cumulative from Day 0. First email should be on Day 0 (delay: 0).
For ${emailCount} emails over ${totalDays} days, space them approximately ${Math.floor(totalDays / (emailCount - 1))} days apart.

Return strict JSON with an array "steps", where each item has:
- n (1-based step number)
- type ("email" or "sms")
- delay (number, days from Day 0 - cumulative, not relative)
- purpose (short label fitted to the goal/audience)

Full Intake:
${JSON.stringify(intake, null, 2)}
`;
};

// Helper function to extract total days from cadence string
function extractTotalDays(cadence: string): number {
  // Look for patterns like "10 weeks", "3 months", "45 days", etc.
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

  // Default to 45 days if pattern not recognized
  return 45;
}
