# NewFed Campaign Builder - Developer Guide

A comprehensive guide to understanding and extending the NewFed Campaign Builder application.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Configuration Files](#configuration-files)
5. [Application Flow](#application-flow)
6. [Key Components](#key-components)
7. [Data Models & Schemas](#data-models--schemas)
8. [API Routes](#api-routes)
9. [External Dependencies & Services](#external-dependencies--services)
10. [Setup Instructions](#setup-instructions)
11. [Development Workflow](#development-workflow)
12. [Testing Strategy](#testing-strategy)
13. [Building & Deployment](#building--deployment)

---

## Project Overview

**Project Name:** newfed-campaign-builder  
**Version:** 0.1.0  
**Type:** Next.js 14 Full-Stack Application  
**Purpose:** A stateless planner that interviews marketers, calls OpenAI to build email campaign journeys, and outputs complete campaign copy ready for Total Expert integration.

### Core Features

- **Interactive Intake Form:** Multi-step questionnaire collecting campaign parameters
- **AI-Powered Planning:** Uses GPT-4o-mini to generate campaign pacing and email steps
- **AI Content Generation:** Uses GPT-4o to write campaign copy and subject lines
- **Compliance Validation:** Enforces financial/mortgage industry compliance rules
- **Tone Management:** Extracts and applies brand voice from CSV catalogs
- **SMS Integration:** Optional SMS touchpoints alongside email cadence
- **A/B Subject Testing:** Support for variant subject lines
- **Dark Mode:** Full light/dark theme support

---

## Tech Stack

### Core Framework
- **Next.js** (14.2.3) - React framework with App Router
- **React** (18.3.1) - UI library
- **TypeScript** (5.4.5) - Static type checking

### AI & APIs
- **OpenAI** (4.53.2) - GPT-4o and GPT-4o-mini API integration
  - Planning: `gpt-4o-mini` with JSON mode
  - Content Writing: `gpt-4o` standard mode

### UI & Styling
- **Tailwind CSS** (3.4.0) - Utility-first CSS framework
- **Framer Motion** (12.23.22) - Animation library
- **Lucide React** (0.545.0) - Icon library
- **@tailwindcss/forms** (0.5.10) - Form component styling
- **@tailwindcss/typography** (0.5.19) - Prose styling

### Data Validation & Processing
- **Zod** (3.23.8) - TypeScript-first schema validation
- **csv-parse** (5.5.3) - CSV parsing for tone catalog harvesting

### Development Tools
- **TypeScript** - Type safety
- **Vitest** (1.5.3) - Unit testing framework
- **ESLint** (8.57.0) - Code linting with Next.js config
- **PostCSS** (8.5.6) - CSS transformation
- **Autoprefixer** (10.4.21) - Browser vendor prefixes
- **tsx** (4.7.1) - TypeScript executor for scripts

### Package Manager
- **pnpm** (9.1.0) - Fast, reliable dependency management

---

## Directory Structure

```
NFM-journey-dev/
├── app/                           # Next.js App Router directory
│   ├── api/                       # API routes
│   │   ├── plan/
│   │   │   └── route.ts          # POST /api/plan - Campaign planning endpoint
│   │   └── write/
│   │       └── route.ts          # POST /api/write - Content generation endpoint
│   ├── components/                # React components
│   │   ├── Chat.tsx              # Legacy chat component
│   │   ├── ModernChat.tsx        # Modern multi-step intake form
│   │   ├── ModernOutput.tsx      # Campaign output display/editing
│   │   ├── Output.tsx            # Legacy output component
│   │   ├── ThemeProvider.tsx     # Theme context provider (light/dark)
│   │   └── ThemeToggle.tsx       # Theme toggle button
│   ├── lib/                       # Utility functions and business logic
│   │   ├── campaign/
│   │   │   └── validation.ts     # Campaign output validation rules
│   │   ├── catalog/
│   │   │   ├── intake.ts         # Intake form steps, validation, types
│   │   │   ├── rules.ts          # Compliance rules, defaults
│   │   │   ├── tone.ts           # Tone snippet selection logic
│   │   │   └── tone.json         # Generated tone snippets (built via script)
│   │   ├── openai.ts             # OpenAI client initialization
│   │   ├── prompts/
│   │   │   ├── planner.ts        # Prompt for campaign planning
│   │   │   ├── system.ts         # System prompt for all LLM calls
│   │   │   ├── writer.ts         # Prompt for content generation
│   │   │   └── render.ts         # Campaign output formatting
│   │   └── schemas/
│   │       └── intake.ts         # Zod schema for intake payload validation
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Home page (main application)
│   └── globals.css                # Global styles, Tailwind directives, theme vars
├── data/                          # Data files
│   ├── newfed_catalog.csv         # Tone snippet source material
│   └── .gitkeep
├── scripts/                       # Build and utility scripts
│   └── harvest-tone.ts            # CSV → JSON tone snippet extractor
├── tests/                         # Test suite
│   ├── intake.test.ts             # Intake validation tests
│   ├── validation.test.ts         # Campaign output validation tests
│   ├── plan-route.test.ts         # /api/plan endpoint tests
│   ├── planner-prompt.test.ts     # Planner prompt generation tests
│   └── writer-prompt.test.ts      # Writer prompt generation tests
├── .env.example                   # Environment variable template
├── .env.local                     # (gitignored) Actual env vars
├── .eslintrc.json                 # ESLint configuration
├── .gitignore                     # Git ignore rules
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies and scripts
├── pnpm-lock.yaml                 # Lock file (pnpm)
├── postcss.config.js              # PostCSS/Tailwind config
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts               # Vitest configuration
├── next-env.d.ts                  # Next.js type definitions
└── README.md                      # Quick start guide
```

---

## Configuration Files

### `package.json`
- **Scripts:**
  - `dev` - Start dev server (localhost:3000)
  - `build` - Build for production
  - `start` - Start production server
  - `lint` - Run ESLint
  - `test` - Run Vitest suite
- **Package Manager:** pnpm 9.1.0 (specified via `packageManager` field)

### `tsconfig.json`
- **Target:** ES2020
- **Module:** esnext with bundler resolution
- **JSX:** preserve (let Next.js handle)
- **Path Alias:** `@/*` maps to root directory
- **Strict Mode:** Enabled
- **Testing:** Vitest globals configured

### `next.config.mjs`
- **Configuration:** Minimal (empty config object)
- **Type:** ESM module

### `tailwind.config.js`
- **Content Paths:** `./app/**/*.{js,ts,jsx,tsx,mdx}`
- **Dark Mode:** Class-based (`darkMode: 'class'`)
- **Custom Colors:**
  - Primary (blue palette)
  - Gray (extended palette)
- **Custom Animations:** fade-in, slide-up, slide-down, spin-slow, pulse-slow
- **Plugins:** @tailwindcss/forms, @tailwindcss/typography

### `postcss.config.js`
- **Plugins:** tailwindcss, autoprefixer

### `vitest.config.ts`
- **Environment:** Node.js
- **Globals:** Enabled
- **Test Pattern:** `tests/**/*.test.ts`
- **Path Alias:** `@` maps to root

### `.env.example`
```
OPENAI_API_KEY=
```

### `.eslintrc.json`
- **Extends:** `next/core-web-vitals` (Next.js best practices)

### `.gitignore`
- Ignores: node_modules, .next, .env.local, .env, IDE configs, coverage

---

## Application Flow

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User lands on home page (/)                                  │
│    ↓                                                             │
│ 2. ModernChat component displays 6-step intake form:            │
│    • Step 1: Campaign Goal                                      │
│    • Step 2: Target Audience                                    │
│    • Step 3: Campaign Length & Cadence                          │
│    • Step 4: SMS Inclusion & Placement                          │
│    • Step 5: Topics to Emphasize/Avoid                          │
│    • Step 6: A/B Subject Line Testing                           │
│    ↓                                                             │
│ 3. Form submission validation via INTAKE_STEPS[].validate()     │
│    ↓                                                             │
│ 4. Payload sent to POST /api/plan                               │
│    ├─ Validates intake via intakePayloadSchema                  │
│    ├─ Calls OpenAI (gpt-4o-mini) OR fallback plan generation   │
│    └─ Returns plan with email/SMS steps + delays                │
│    ↓                                                             │
│ 5. Plan displayed in "Plan Overview" section                    │
│    ↓                                                             │
│ 6. Tone snippets selected via selectToneSnippets()              │
│    ├─ Matches audience/purposes from plan                       │
│    └─ Returns top 6 snippets or fallback                        │
│    ↓                                                             │
│ 7. Payload sent to POST /api/write with:                        │
│    ├─ Original intake                                           │
│    ├─ Generated plan                                            │
│    ├─ Selected tone snippets                                    │
│    └─ A/B subject flag                                          │
│    ↓                                                             │
│ 8. OpenAI (gpt-4o) writes campaign content                      │
│    ├─ Validates output via validateCampaignOutput()             │
│    ├─ Checks compliance patterns                                │
│    └─ Returns formatted campaign text or error                  │
│    ↓                                                             │
│ 9. ModernOutput displays campaign with:                         │
│    ├─ Copy to clipboard button                                  │
│    ├─ Download button                                           │
│    ├─ View toggle (formatted/raw)                               │
│    └─ Reset button to start over                                │
│    ↓                                                             │
│ 10. User exports campaign to Total Expert                       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend (React Components)                                      │
│                                                                  │
│ ModernChat.tsx (State Manager)                                  │
│  ├─ useState: answers (IntakeAnswers)                          │
│  ├─ useState: errors (validation feedback)                     │
│  └─ useState: drafts (intermediate form state)                 │
│       │                                                         │
│       └─> Validation via INTAKE_STEPS[].validate()            │
│           (Uses Zod schemas)                                    │
└─────────────────────────────────────────────────────────────────┘
            │
            │ POST /api/plan
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend (Next.js API Routes)                                    │
│                                                                  │
│ /api/plan (route.ts)                                            │
│  ├─ Receive: { intake: IntakePayload }                         │
│  ├─ Validate: intakePayloadSchema.safeParse()                 │
│  ├─ Normalize: SMS placement, cadence extraction                │
│  ├─ Plan Generation:                                           │
│  │  ├─ Try: fetchPlanFromOpenAI()                             │
│  │  │  └─ OpenAI.chat.completions.create()                   │
│  │  │     (model: gpt-4o-mini, format: json)                 │
│  │  └─ Fallback: fallbackPlan()                              │
│  │     (Spreads emails evenly if no API key)                 │
│  └─ Return: { steps: PlanStep[] }                            │
│                                                                  │
│  Where PlanStep = {                                             │
│    n: number (1-based step number)                             │
│    type: "email" | "sms"                                       │
│    delay: number (days from start)                             │
│    purpose: string (content theme)                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
            │
            │ selectToneSnippets() + POST /api/write
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ /api/write (route.ts)                                           │
│  ├─ Receive:                                                    │
│  │  ├─ intake: IntakePayload                                  │
│  │  ├─ plan: PlanResponse                                     │
│  │  ├─ toneSnippets: ToneSnippet[]                           │
│  │  └─ abSubjects: boolean                                    │
│  ├─ Validate: requestSchema.safeParse()                       │
│  ├─ Build Prompts:                                             │
│  │  ├─ SYSTEM_PROMPT (compliance + tone rules)               │
│  │  └─ writerPrompt() (plan JSON + snippets + instructions)  │
│  ├─ Generate Content:                                          │
│  │  └─ OpenAI.chat.completions.create()                      │
│  │     (model: gpt-4o, temperature: 0.6)                     │
│  ├─ Validate Output:                                           │
│  │  ├─ validateCampaignOutput()                              │
│  │  ├─ Check: format, subject lengths, compliance             │
│  │  └─ Return validation result or errors                     │
│  └─ Return: { text: string }                                   │
│     (Campaign copy ready for copy/download)                    │
└─────────────────────────────────────────────────────────────────┘
            │
            └─> ModernOutput.tsx displays campaign
```

---

## Key Components

### 1. **ModernChat.tsx** (Interactive Intake Form)
**Path:** `/home/user/NFM-journey-dev/app/components/ModernChat.tsx`

**Purpose:** Multi-step questionnaire that guides users through campaign configuration.

**Key Props:**
- `onComplete: (answers: IntakeAnswers, payload: IntakePayload) => void` - Callback when form completes
- `isLoading?: boolean` - Show loading state

**State Management:**
- `stepIndex` - Current form step (0-5)
- `answers` - Finalized intake answers
- `drafts` - Intermediate form state per step
- `errors` - Field-level validation errors

**Features:**
- Progress bar showing completion
- Step icons (Target, Users, Clock, etc.)
- Conditional field rendering (e.g., SMS placement shows only if SMS enabled)
- Real-time error clearing
- Summary display of all answers
- Animation transitions between steps

**Validation Flow:**
```typescript
INTAKE_STEPS[currentStep].validate(currentDraft)
  → StepValidationResult {
      success: boolean,
      values?: Partial<IntakeAnswers>,
      draft?: IntakeDraft,
      errors?: Record<string, string>
    }
```

### 2. **ModernOutput.tsx** (Campaign Display)
**Path:** `/home/user/NFM-journey-dev/app/components/ModernOutput.tsx`

**Purpose:** Display, format, and export generated campaign content.

**Key Props:**
- `text: string` - Raw campaign output
- `isLoading?: boolean` - Show loading animation
- `onReset?: () => void` - Reset handler

**Features:**
- Copy to clipboard (with feedback)
- Download as .txt file
- Formatted vs. raw view toggle
- Plan overview section
- Error display with compliance warnings
- Loading state with spinner

### 3. **ThemeProvider.tsx** & **ThemeToggle.tsx**
**Purpose:** Light/dark mode theme management

**Implementation:**
- Uses React Context for theme state
- Persists to localStorage
- Respects system preference on first load
- Updates `dark` class on `<html>` element for Tailwind

---

## Data Models & Schemas

### 1. **IntakeAnswers** (User Input Model)
**File:** `/home/user/NFM-journey-dev/app/lib/catalog/intake.ts`

```typescript
type IntakeAnswers = {
  goal: string;                      // Campaign objective
  audience: string;                  // Target audience description
  length: number | null;             // Email count (nullable for "decide for me")
  cadence: string | null;            // Pacing description (e.g., "balanced", "3 months")
  includeSms: boolean;               // Enable SMS touchpoints
  smsPlacement: number[];            // Which email steps get SMS variants
  emphasize: string;                 // Optional topics to highlight
  avoid: string;                     // Optional topics to avoid
  abSubjects: boolean;               // Generate A/B subject variants
};
```

### 2. **IntakePayload** (API Request Model)
**File:** `/home/user/NFM-journey-dev/app/lib/schemas/intake.ts`

```typescript
export const intakePayloadSchema = z.object({
  goal: z.string().min(3),
  audience: z.string().min(3),
  length: z.number().int().positive().max(30).nullable(),
  cadence: z.string().min(2).max(120).nullable(),
  includeSms: z.boolean(),
  smsPlacement: z.array(z.number().int().positive()).default(DEFAULT_SMS_STEPS),
  emphasize: z.string().optional().default(""),
  avoid: z.string().optional().default(""),
  abSubjects: z.boolean()
});
```

### 3. **PlanStep** (Campaign Schedule Unit)
**Used in:** `/api/plan` response

```typescript
type PlanStep = {
  n: number;              // 1-based step number
  type: "email" | "sms";  // Channel type
  delay: number;          // Days from campaign start
  purpose: string;        // Content theme (e.g., "set-expectations", "deliver-value")
};
```

### 4. **ToneSnippet** (Brand Voice Sample)
**File:** `/home/user/NFM-journey-dev/app/lib/catalog/tone.ts`

```typescript
type ToneSnippet = {
  id: string;                    // MD5 hash of normalized text
  text: string;                  // Sentence snippet (6-25 words)
  audiences: string[];           // Relevant audience segments
  purposes: string[];            // Campaign purposes it fits
};
```

Sourced from: `data/newfed_catalog.csv` → Harvested via `scripts/harvest-tone.ts` → `app/lib/catalog/tone.json`

---

## API Routes

### `POST /api/plan`

**Purpose:** Generate campaign pacing and step structure.

**Request Schema:**
```typescript
{
  intake: IntakePayload
}
```

**Response:**
```typescript
{
  steps: Array<{
    n: number;              // Step number (1-based)
    type: "email" | "sms";  // Channel
    delay: number;          // Days from start
    purpose: string;        // Theme (e.g., "set-expectations", "educate")
  }>
}
```

**Implementation Details:**

1. **Input Validation:**
   - Validates intake against `intakePayloadSchema`
   - Normalizes SMS placement (removes duplicates, sorts)

2. **Plan Generation (Preferred):**
   - Calls `openai.chat.completions.create()` with:
     - Model: `gpt-4o-mini`
     - Temperature: 0.2 (low randomness)
     - Response format: `json_object`
     - System prompt + planner prompt

3. **Fallback Plan (No API Key):**
   - Uses `DEFAULT_DELAYS` array: `[1, 4, 7, 11, 17, 24, 33, 45]`
   - Spreads emails evenly across `totalDays` based on cadence
   - Applies default email purposes from `DEFAULT_PURPOSES`

4. **Post-Processing:**
   - Converts cumulative to relative delays
   - Deduplicates steps by (n, type) pair
   - Validates format with `planSchema` (Zod)

**Error Handling:**
- Returns `{ error: "..." }` with HTTP 400/500 status
- Gracefully falls back to plan generation without OpenAI

---

### `POST /api/write`

**Purpose:** Generate full campaign copy (subjects, preheaders, body copy).

**Request Schema:**
```typescript
{
  intake: IntakePayload,
  plan: PlanResponse,           // Output from /api/plan
  toneSnippets: ToneSnippet[],  // Selected snippets
  abSubjects: boolean           // Generate A/B variants?
}
```

**Response:**
```typescript
{
  text: string  // Campaign copy formatted per SYSTEM_PROMPT rules
}
```

**Output Format Per Step:**
```
Step N • Email • Delay: X
Preheader: [preheader text, <=90 chars]
Subject A: [subject variant A, <=55 chars]
Subject B: [subject variant B, <=55 chars]
Body:
[Plain text email body with {{recipient.f_name}} merge variable]

Step N+1 • Email • Delay: Y
...
```

**Implementation Details:**

1. **Input Validation:**
   - Validates request against `requestSchema` (Zod)
   - Requires valid tone snippets array
   - Checks for OpenAI credentials

2. **Prompt Construction:**
   - System: `SYSTEM_PROMPT` (rules + constraints)
   - User: `writerPrompt()` with:
     - Plan JSON (step structure)
     - Intake details (goal, audience, emphasis, avoid)
     - Tone snippets (formatted list)
     - A/B subject flag
     - Location extraction from audience

3. **Content Generation:**
   - Calls `openai.chat.completions.create()` with:
     - Model: `gpt-4o`
     - Temperature: 0.6 (balanced creativity)
     - No response format constraint (natural text output)

4. **Output Validation:**
   - Calls `validateCampaignOutput()` with:
     - Checks step count matches plan
     - Validates subject line format & length
     - Ensures preheader <=90 chars
     - Verifies `{{recipient.f_name}}` in body
     - Checks for compliance violations (banned patterns)
     - Ensures no external links in body

5. **Compliance Checks (BANNED_PATTERNS):**
   - `/\bguarantee(d)?\b/i` - No guarantee language
   - `/\bpre-?approved\b/i` - No pre-approval claims
   - `/\b\d{1,2}\.?\d{0,2}\s?%\b/i` - No rate quotes
   - `/\bAPR\s?\d/i` - No APR + number combinations

**Error Handling:**
- Returns validation errors if content fails checks
- Returns 422 Unprocessable Entity on validation failure
- Returns 500 if OpenAI call fails

---

## External Dependencies & Services

### OpenAI API

**Integration File:** `/home/user/NFM-journey-dev/app/lib/openai.ts`

```typescript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

**Models Used:**
1. **gpt-4o-mini** (Planning)
   - Used in `/api/plan`
   - Temperature: 0.2 (deterministic)
   - Requires: `response_format: { type: "json_object" }`
   - Cost: Lower than gpt-4o
   - Speed: Faster

2. **gpt-4o** (Writing)
   - Used in `/api/write`
   - Temperature: 0.6 (balanced creativity)
   - Standard text response (no JSON mode)
   - Cost: Higher than gpt-4o-mini
   - Quality: Higher detail + creativity

**Cost Considerations:**
- Planning step: ~0.15¢ per request (small input/output)
- Writing step: ~1-2¢ per request (large context + output)
- Estimated per campaign: ~2-3¢

**Failure Modes:**
- Missing API key → Falls back to plan generation
- API timeout → Caught and returned as 500 error
- Invalid response format → Parsed error or 500

---

## Setup Instructions

### Prerequisites

- **Node.js:** 18+ (LTS recommended)
- **pnpm:** 9.1.0+ (can install via `npm install -g pnpm@9.1.0`)
- **OpenAI Account:** API key for gpt-4o and gpt-4o-mini access

### Step 1: Clone & Install Dependencies

```bash
# Clone repository
git clone <repo-url>
cd NFM-journey-dev

# Install dependencies
pnpm install
```

### Step 2: Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

### Step 3: Prepare Tone Catalog (Optional)

If you have a `newfed_catalog.csv` file with email journey examples:

```bash
# Extract tone snippets from CSV
pnpm tsx scripts/harvest-tone.ts \
  --in data/newfed_catalog.csv \
  --out app/lib/catalog/tone.json
```

This populates `app/lib/catalog/tone.json` with brand voice samples.

### Step 4: Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

---

## Development Workflow

### Adding a New Intake Question

1. **Define the Step** in `app/lib/catalog/intake.ts`:
   ```typescript
   {
     id: "newField",
     title: "Your Question Title",
     prompts: [
       {
         id: "fieldName",
         label: "Display label",
         type: "text" | "boolean",
         placeholder: "...",
         optional: true,
         showWhen: (draft) => draft.someCondition === true
       }
     ],
     validate: (draft) => {
       // Return { success, values, errors }
     }
   }
   ```

2. **Update IntakeAnswers Type:**
   ```typescript
   type IntakeAnswers = {
     // ... existing fields
     newField: string | boolean;
   };
   ```

3. **Update IntakePayload Schema:**
   ```typescript
   export const intakePayloadSchema = z.object({
     // ... existing fields
     newField: z.string().min(1)
   });
   ```

4. **Update DEFAULT_ANSWERS:**
   ```typescript
   export const DEFAULT_ANSWERS: IntakeAnswers = {
     // ... existing defaults
     newField: ""
   };
   ```

5. **Test the validation** in `tests/intake.test.ts`.

### Modifying Compliance Rules

1. **Edit** `app/lib/catalog/rules.ts`:
   ```typescript
   export const BANNED_PATTERNS = [
     /your-new-pattern/i,
     // ... existing patterns
   ];
   ```

2. **Update** the validation function in `app/lib/campaign/validation.ts` if needed.

3. **Add test cases** in `tests/validation.test.ts`.

### Adjusting AI Prompts

**System Prompt:** `app/lib/prompts/system.ts`
- Core rules for all LLM calls
- Edit constraints, tone, output format

**Planner Prompt:** `app/lib/prompts/planner.ts`
- Input: IntakePayload
- Output: Plan structure
- Adjust pacing logic or examples

**Writer Prompt:** `app/lib/prompts/writer.ts`
- Input: Plan + intake + tone snippets
- Output: Campaign copy
- Adjust voice, section structure, or constraints

### Updating Tone Snippets

1. **Update** `data/newfed_catalog.csv` with new email journeys
2. **Run harvesting script:**
   ```bash
   pnpm tsx scripts/harvest-tone.ts \
     --in data/newfed_catalog.csv \
     --out app/lib/catalog/tone.json
   ```
3. **Verify** generated `tone.json` contains expected snippets

---

## Testing Strategy

### Test Files

- `tests/intake.test.ts` - Form validation logic
- `tests/validation.test.ts` - Campaign output validation
- `tests/plan-route.test.ts` - `/api/plan` endpoint behavior
- `tests/planner-prompt.test.ts` - Planner prompt generation
- `tests/writer-prompt.test.ts` - Writer prompt generation

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/intake.test.ts

# Watch mode
pnpm test --watch
```

### Key Test Cases

**Intake Validation:**
- Form step progression and validation
- SMS placement parsing
- "Decide for me" handling
- Default value application

**Campaign Validation:**
- Correct step count
- Subject line length limits
- Preheader character count
- Merge variable presence
- Link detection
- Compliance pattern matching

**API Routes:**
- Request schema validation
- Fallback plan generation
- Error handling

### Test Configuration

**File:** `vitest.config.ts`
- Environment: Node.js
- Globals: Enabled (no need to import `describe`, `it`, `expect`)
- Pattern: `tests/**/*.test.ts`

---

## Building & Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server (must run build first)
pnpm start
```

### Build Artifacts

- `.next/` - Compiled Next.js application
- `pnpm-lock.yaml` - Frozen dependency versions

### Environment Variables

**Required in Production:**
- `OPENAI_API_KEY` - Your OpenAI API key

**Recommended:**
- Set via environment variable (not `.env.local`)
- Use secret management (Vercel Secrets, AWS Secrets Manager, etc.)

### Deployment Platforms

**Vercel (Recommended):**
1. Push code to GitHub/GitLab/Bitbucket
2. Connect repo to Vercel
3. Add `OPENAI_API_KEY` to environment variables
4. Deploy with `pnpm` as package manager

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

**Self-Hosted:**
1. Run `pnpm build` on target machine
2. Run `pnpm start` (requires Node.js 18+)
3. Proxy requests through nginx/Apache
4. Use process manager (PM2, systemd, etc.)

### Performance Optimization

- **Next.js:** Automatic code splitting, image optimization
- **Tailwind:** CSS purging included in build
- **Icons:** Tree-shakeable lucide-react
- **Animations:** GPU-accelerated Framer Motion

### Monitoring & Logging

- **Dev:** `console.error()` logs in terminal
- **Prod:** Monitor server logs and error tracking (Sentry, DataDog, etc.)
- **API Errors:** Logged server-side; returned to client in error responses

---

## Troubleshooting

### "OPENAI_API_KEY is not set"

**Issue:** Development warning if `.env.local` missing or empty.

**Solution:**
```bash
cp .env.example .env.local
# Edit .env.local with your actual API key
```

### Campaign Fails Validation

**Issue:** Generated content returns 422 with validation errors.

**Debug:**
1. Check `validateCampaignOutput()` error messages
2. Verify compliance patterns not triggered
3. Ensure subject lines ≤55 chars, preheader ≤90 chars
4. Check `{{recipient.f_name}}` appears in body

### Tests Failing Locally

**Issue:** Vitest environment mismatch.

**Solution:**
```bash
# Clear cache
pnpm test --no-coverage --reporter=verbose

# Check Node version
node --version  # Should be 18+
```

---

## Summary

This codebase implements a sophisticated email campaign generator that:

1. **Captures requirements** through an intuitive multi-step form
2. **Plans campaigns** using AI to structure optimal email sequences
3. **Generates copy** respecting brand voice and compliance rules
4. **Validates output** against industry-specific constraints
5. **Exports content** ready for marketing platforms like Total Expert

The architecture balances **AI flexibility** with **rule-based safety**, using OpenAI's latest models while maintaining deterministic fallbacks and comprehensive validation.

For questions or contributions, refer to the inline code comments and test files for implementation details.

