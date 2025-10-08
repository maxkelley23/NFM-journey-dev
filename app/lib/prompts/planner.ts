export const plannerPrompt = (intake: any) => `
Plan an email${intake.includeSms ? " + SMS" : ""} campaign given the intake below.
Use the default 8-email/45-day cadence unless specified. Delays are relative to the previous step; first send is Day 1.
If SMS is included, place SMS at steps 3 and 7 unless the user specified otherwise.

Return strict JSON with an array "steps", where each item has:
- n (1-based step number)
- type ("email" or "sms")
- delay (number, days relative to previous step)
- purpose (short label fitted to the goal/audience)

Intake:
${JSON.stringify(intake, null, 2)}
`;
