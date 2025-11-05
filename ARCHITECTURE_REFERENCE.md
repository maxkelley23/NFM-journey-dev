# Architecture Reference - Quick Lookup

## File Structure Overview

```
app/
├── api/plan/route.ts          → Receives intake, calls OpenAI or fallback, returns PlanStep[]
├── api/write/route.ts         → Receives plan+intake+snippets, generates campaign text
├── page.tsx                   → Main page with state management, orchestrates flow
├── layout.tsx                 → Root HTML layout, theme provider
├── globals.css                → Tailwind directives + theme CSS variables
├── components/
│   ├── ModernChat.tsx         → 6-step intake form with validation
│   ├── ModernOutput.tsx       → Display, copy, download campaign
│   ├── ThemeProvider.tsx      → React Context for dark/light mode
│   └── ThemeToggle.tsx        → Theme toggle button
└── lib/
    ├── openai.ts              → OpenAI client setup
    ├── catalog/
    │   ├── intake.ts          → INTAKE_STEPS[], IntakeAnswers, validation logic
    │   ├── rules.ts           → DEFAULT_DELAYS, SUBJECT_MAX, BANNED_PATTERNS
    │   ├── tone.ts            → selectToneSnippets() - matches audience to snippets
    │   └── tone.json          → Generated tone snippets (from CSV harvest)
    ├── schemas/
    │   └── intake.ts          → Zod validation schema for API payloads
    ├── prompts/
    │   ├── system.ts          → System prompt (compliance rules, tone)
    │   ├── planner.ts         → Prompt for campaign planning step
    │   ├── writer.ts          → Prompt for content generation
    │   └── render.ts          → Campaign output formatting helper
    └── campaign/
        └── validation.ts      → validateCampaignOutput() - compliance checks

data/
└── newfed_catalog.csv         → Source material for tone snippet extraction

scripts/
└── harvest-tone.ts            → CLI: csv-parse → tone.json converter

tests/
├── intake.test.ts             → Form validation tests
├── validation.test.ts         → Campaign output validation tests
├── plan-route.test.ts         → API endpoint tests
├── planner-prompt.test.ts     → Prompt generation tests
└── writer-prompt.test.ts      → Content prompt tests
```

## Data Types

```
IntakeDraft (Form State)
  ├─ goal?, audience?, length?, cadence?, etc.
  ├─ Intermediate values during form filling
  └─ Types: text, boolean, with optional fields

IntakeAnswers (Finalized User Input)
  ├─ goal: string (required)
  ├─ audience: string (required)
  ├─ length: number | null
  ├─ cadence: string | null
  ├─ includeSms: boolean
  ├─ smsPlacement: number[]
  ├─ emphasize: string
  ├─ avoid: string
  └─ abSubjects: boolean

IntakePayload (API Request Model)
  ├─ Same fields as IntakeAnswers
  └─ Validated by Zod intakePayloadSchema

PlanResponse
  └─ steps: PlanStep[]

PlanStep
  ├─ n: number (1-based)
  ├─ type: "email" | "sms"
  ├─ delay: number (days from start)
  └─ purpose: string (e.g., "set-expectations", "deliver-value")

ToneSnippet
  ├─ id: string (MD5 hash)
  ├─ text: string (6-25 words)
  ├─ audiences: string[] (e.g., ["first-time-buyers", "general"])
  └─ purposes: string[] (e.g., ["soft-cta", "general"])
```

## Core Workflows

### 1. Intake Form Submission

```
User fills form → ModernChat validates per INTAKE_STEPS[].validate()
  ↓
IntakeDraft → Zod schema validation
  ↓
IntakeAnswers stored in state
  ↓
onClick "Submit" → toApiIntake() → POST /api/plan
```

### 2. Plan Generation (/api/plan)

```
POST /api/plan { intake: IntakePayload }
  ↓
intakePayloadSchema.safeParse()
  ↓
Branch:
  A) if OPENAI_API_KEY exists:
     → openai.chat.completions.create(
         model: "gpt-4o-mini",
         response_format: { type: "json_object" }
       )
     → Parse JSON → validate with planSchema
  B) if no key:
     → fallbackPlan(intake)
     → spread emails across cadence days
  ↓
normalizePlanSteps()
  ↓
Return { steps: PlanStep[] }
```

### 3. Tone Selection

```
emailPurposes = plan.steps
  .filter(s => s.type === "email")
  .map(s => s.purpose)
  ↓
selectToneSnippets({
  audience: intake.audience,
  purposes: emailPurposes
})
  ↓
Score each snippet:
  - Audience match +2, general +1
  - Purpose match +2, general +1
  ↓
Sort by score → slice(0, 6)
```

### 4. Content Generation (/api/write)

```
POST /api/write {
  intake, plan, toneSnippets, abSubjects
}
  ↓
requestSchema.safeParse()
  ↓
openai.chat.completions.create(
  model: "gpt-4o",
  system: SYSTEM_PROMPT,
  user: writerPrompt(plan, intake, snippets, ab)
)
  ↓
parseResponse() → raw campaign text
  ↓
validateCampaignOutput(text, { abSubjects, expectedSteps })
  ├─ Check: Step N • Email • Delay: X format
  ├─ Check: Preheader ≤90 chars, no variables
  ├─ Check: Subject A/B ≤55 chars (if AB requested)
  ├─ Check: {{recipient.f_name}} in body
  ├─ Check: No links, no banned patterns
  └─ Return: { isValid, issues }
  ↓
if valid → Return { text }
if invalid → Return 422 with validation errors
```

## Compliance Rules

### Banned Patterns
```
- /\bguarantee(d)?\b/i          No guarantee language
- /\bpre-?approved\b/i          No pre-approval claims
- /\b\d{1,2}\.?\d{0,2}\s?%\b/i  No percentage rates (e.g., "3.5%")
- /\bAPR\s?\d/i                 No APR + number (e.g., "APR 3.5")
```

### Size Limits
```
- Subject line:  ≤55 characters
- Preheader:    ≤90 characters
- Campaign:     Must be plain text (no HTML tags)
```

### Required Fields
```
- Merge variable {{recipient.f_name}} must appear in email body
- No external links allowed in body
- Preheader cannot contain merge variables
```

## Environment & Configuration

### Environment Variables
```
OPENAI_API_KEY=sk-...  (Required for AI features)
```

### Default Values
```
DEFAULT_DELAYS = [1, 4, 7, 11, 17, 24, 33, 45]      (8 email cadence)
DEFAULT_SMS_STEPS = [3, 7]                           (SMS placement)
SUBJECT_MAX = 55                                     (chars)
PREHEADER_MAX = 90                                   (chars)
```

### Cadence Parsing
```
Input: "decide for me" → Becomes null → Defaults to 45 days, 8 emails
Input: "3 weeks" → Extracted: 21 days
Input: "2 months" → Extracted: 60 days
Input: "30 days" → Extracted: 30 days
```

## Testing Checklist

- [ ] Intake form validates all 6 steps
- [ ] SMS placement parsing works (comma-separated numbers)
- [ ] "Decide for me" defaults to 45 days + 8 emails
- [ ] Plan generation returns exactly requested email count
- [ ] Campaign validation checks all compliance rules
- [ ] Subject lines respect 55-char limit
- [ ] Preheaders respect 90-char limit
- [ ] {{recipient.f_name}} required in body
- [ ] No external links in body
- [ ] Banned patterns fail validation
- [ ] A/B subjects generates 2 variants when requested
- [ ] Single subject when A/B not requested

## Performance Notes

### OpenAI API Costs (Estimated)
```
/api/plan:   ~0.15¢ (gpt-4o-mini)
/api/write:  ~1-2¢ (gpt-4o)
Per campaign: ~2-3¢ total
```

### Build Output
```
.next/       → Compiled Next.js
.next/server → API routes + SSR
.next/static → Client bundles + Tailwind CSS
```

### Client-Side State
```
- Theme preference stored in localStorage
- Form drafts stored in component state (not persisted)
- Campaign text in component state (for copy/download)
```

## Debugging Tips

### API Routes
- Check server logs for OpenAI errors
- Use Zod `.safeParse()` for detailed validation errors
- Fallback behavior kicks in silently if no API key

### Validation Failures
- Use `validateCampaignOutput()` to inspect exact issues
- Check email body for `{{recipient.f_name}}` placement
- Verify subject/preheader lengths in raw text

### Tone Snippets
- Check `tone.json` file exists and is valid JSON
- Verify CSV has "Journey Name" column + email content
- Run harvest script to regenerate snippets

### Form Issues
- Check INTAKE_STEPS array for correct order
- Verify step IDs match keys in drafts object
- Ensure validator returns { success, values, errors }

---

Last Updated: November 2024
