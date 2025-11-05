# Repository Analysis Summary

## Documentation Created

I've created comprehensive documentation for the NewFed Campaign Builder project:

### 1. **DEVELOPER_GUIDE.md** (932 lines)
The complete developer reference covering:
- Project overview and features
- Full tech stack breakdown
- Detailed directory structure with descriptions
- Configuration files explained
- Complete application flow diagrams
- Key components explained with code examples
- Data models and TypeScript types
- API route documentation
- External dependencies (OpenAI integration)
- Setup instructions (step-by-step)
- Development workflow patterns
- Testing strategy and execution
- Building and deployment guides
- Troubleshooting section

### 2. **ARCHITECTURE_REFERENCE.md** (Quick Lookup)
Fast reference guide with:
- File structure with line-by-line mappings
- Data types summary (IntakeDraft, IntakeAnswers, PlanStep, etc.)
- Core workflows (Intake → Planning → Tone Selection → Content Generation)
- Compliance rules checklist
- Environment variables and defaults
- Testing checklist
- Performance notes
- Debugging tips

---

## Key Findings

### Project Type
- **Next.js 14** full-stack application with App Router
- **Stateless** design (no database, all computation API-driven)
- **AI-powered** email campaign generator for mortgage industry

### Tech Stack Highlights
- **Frontend:** React 18, Tailwind CSS, Framer Motion, Lucide icons
- **Backend:** Next.js API routes, TypeScript
- **AI:** OpenAI gpt-4o and gpt-4o-mini
- **Validation:** Zod schemas
- **Testing:** Vitest
- **Package Manager:** pnpm 9.1.0

### Core Architecture

**3-Step Process:**
1. **Intake Form** (ModernChat) - Collects 6 inputs:
   - Campaign goal & audience (required)
   - Email count & cadence pacing
   - SMS inclusion & placement
   - Topics to emphasize/avoid
   - A/B subject line preference

2. **Campaign Planning** (/api/plan):
   - Calls GPT-4o-mini to generate email sequence
   - Falls back to deterministic plan if no API key
   - Returns email steps with delays and purposes

3. **Content Generation** (/api/write):
   - Calls GPT-4o to write subject lines, preheaders, body copy
   - Validates against compliance rules
   - Returns formatted campaign ready for Total Expert

### Directory Structure

```
app/
  ├─ api/plan & api/write       (AI orchestration)
  ├─ components/                 (UI: form, output, theme)
  ├─ lib/
  │  ├─ openai.ts              (API client)
  │  ├─ catalog/               (form steps, validation, tone snippets)
  │  ├─ schemas/               (Zod validation)
  │  ├─ prompts/               (LLM instructions)
  │  └─ campaign/              (compliance validation)
  └─ globals.css               (Tailwind + theme variables)

data/
  └─ newfed_catalog.csv        (tone snippet source material)

scripts/
  └─ harvest-tone.ts           (CSV → JSON converter)

tests/
  └─ *.test.ts                 (Vitest suite: 5 test files)
```

### Critical Files to Understand

**Data Flow:**
1. `/app/lib/catalog/intake.ts` - Defines 6-step form with validation
2. `/app/lib/schemas/intake.ts` - Zod schema for API validation
3. `/app/api/plan/route.ts` - Campaign planning endpoint (50 lines)
4. `/app/api/write/route.ts` - Content generation endpoint (95 lines)

**Validation & Rules:**
5. `/app/lib/campaign/validation.ts` - Compliance checking (228 lines)
6. `/app/lib/catalog/rules.ts` - Banned patterns, limits, defaults (12 lines)

**Prompting & Tone:**
7. `/app/lib/prompts/system.ts` - System prompt for all LLM calls
8. `/app/lib/prompts/writer.ts` - Content generation instructions
9. `/app/lib/catalog/tone.ts` - Tone snippet selection logic

**UI Components:**
10. `/app/components/ModernChat.tsx` - Multi-step intake form
11. `/app/components/ModernOutput.tsx` - Campaign display & export
12. `/app/page.tsx` - Main orchestrator (186 lines)

### Setup Checklist

```
✓ Install pnpm 9.1.0
✓ pnpm install
✓ cp .env.example .env.local
✓ Add OPENAI_API_KEY to .env.local
✓ (Optional) pnpm tsx scripts/harvest-tone.ts --in data/newfed_catalog.csv
✓ pnpm dev (runs on localhost:3000)
```

### Testing & Quality

**Test Coverage:**
- Intake form validation (INTAKE_STEPS array)
- Campaign output validation (compliance checks)
- API endpoint behavior
- Prompt generation

**Run Tests:**
```bash
pnpm test
```

**Code Quality:**
- TypeScript strict mode enabled
- Zod schema validation everywhere
- ESLint configuration (Next.js standard)
- 100% type-safe codebase

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.2.3 | Framework |
| React | 18.3.1 | UI |
| TypeScript | 5.4.5 | Types |
| Tailwind | 3.4.0 | Styling |
| OpenAI | 4.53.2 | GPT-4o & gpt-4o-mini |
| Zod | 3.23.8 | Validation |
| Framer Motion | 12.23.22 | Animations |
| Vitest | 1.5.3 | Testing |

### Compliance & Rules

**Banned Patterns:**
- "guarantee" or "guaranteed" language
- "pre-approved" claims
- Specific rate quotes (e.g., "3.5%")
- APR + number combinations

**Size Limits:**
- Subject lines: ≤55 characters
- Preheaders: ≤90 characters

**Required:**
- {{recipient.f_name}} merge variable in body
- No external links
- Preheaders cannot have merge variables

### Deployment Notes

- **Dev:** `pnpm dev` (localhost:3000)
- **Build:** `pnpm build`
- **Prod:** `pnpm start`
- **Recommended:** Vercel (native Next.js support)
- **Alternative:** Docker, self-hosted

---

## How to Use These Guides

### For Understanding the Project
Start with **ARCHITECTURE_REFERENCE.md** for a quick overview, then dive into specific sections of **DEVELOPER_GUIDE.md** as needed.

### For Setting Up Locally
Follow the "Setup Instructions" section in **DEVELOPER_GUIDE.md**.

### For Adding Features
See "Development Workflow" section for patterns on:
- Adding new intake questions
- Modifying compliance rules
- Adjusting AI prompts
- Updating tone snippets

### For Debugging
Consult the "Troubleshooting" section in **DEVELOPER_GUIDE.md** and "Debugging Tips" in **ARCHITECTURE_REFERENCE.md**.

### For Deployment
See "Building & Deployment" section in **DEVELOPER_GUIDE.md**.

---

## Absolute File Paths Reference

Key source files (for quick access):

- `/home/user/NFM-journey-dev/app/page.tsx` - Main application entry
- `/home/user/NFM-journey-dev/app/api/plan/route.ts` - Planning API
- `/home/user/NFM-journey-dev/app/api/write/route.ts` - Content API
- `/home/user/NFM-journey-dev/app/components/ModernChat.tsx` - Intake form
- `/home/user/NFM-journey-dev/app/lib/catalog/intake.ts` - Form definition
- `/home/user/NFM-journey-dev/app/lib/campaign/validation.ts` - Compliance
- `/home/user/NFM-journey-dev/app/lib/prompts/system.ts` - System prompt
- `/home/user/NFM-journey-dev/package.json` - Dependencies
- `/home/user/NFM-journey-dev/README.md` - Quick start
- `/home/user/NFM-journey-dev/DEVELOPER_GUIDE.md` - Full reference
- `/home/user/NFM-journey-dev/ARCHITECTURE_REFERENCE.md` - Quick lookup

---

## What This Project Does

**In Plain English:**

1. User fills out a form describing their email campaign (goal, audience, length, etc.)
2. App calls OpenAI to create an email pacing schedule (which emails on which days)
3. App extracts brand voice snippets from a CSV catalog
4. App calls OpenAI again to write the actual emails (subjects, preheaders, body copy)
5. App validates all output against compliance rules (no rate quotes, no guarantees, etc.)
6. User downloads complete, compliance-approved campaign copy
7. User imports into Total Expert or other email platform

**Total time to complete campaign:** 30-60 seconds (most time is API calls)

**Cost per campaign:** ~2-3¢ in OpenAI API fees

---

Created: November 5, 2024
Repository: NFM-journey-dev
Documentation Version: 1.0
