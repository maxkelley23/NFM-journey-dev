# Documentation Index

Welcome to the NewFed Campaign Builder comprehensive documentation suite.

## Quick Navigation

### Start Here
- **[GUIDE_SUMMARY.md](./GUIDE_SUMMARY.md)** (7.7 KB)
  - Project overview in plain English
  - Key findings and tech stack summary
  - Critical files checklist
  - Setup steps and testing guide

### Complete Reference
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** (32 KB, 932 lines)
  - Full technical documentation
  - Step-by-step setup instructions
  - Development workflows
  - API route documentation
  - Testing strategy
  - Deployment guides
  - Troubleshooting section

### Quick Lookup
- **[ARCHITECTURE_REFERENCE.md](./ARCHITECTURE_REFERENCE.md)** (8.2 KB)
  - File structure mapping
  - Data types reference
  - Core workflows
  - Compliance rules checklist
  - Performance notes
  - Debugging tips

### Original Project README
- **[README.md](./README.md)** (864 B)
  - Quick start (tl;dr)
  - One-line project description
  - Minimal setup instructions

---

## Documentation by Use Case

### "I want to understand this project"
1. Read: GUIDE_SUMMARY.md (5 min)
2. Skim: ARCHITECTURE_REFERENCE.md (5 min)
3. Deep dive: DEVELOPER_GUIDE.md (30 min)

### "I want to set it up locally"
1. Follow: GUIDE_SUMMARY.md → Setup Checklist section
2. Reference: DEVELOPER_GUIDE.md → Setup Instructions section
3. Execute: `pnpm install` → `.env.local` → `pnpm dev`

### "I want to add a feature"
1. Reference: ARCHITECTURE_REFERENCE.md → File Structure
2. Guide: DEVELOPER_GUIDE.md → Development Workflow section
3. Check: Example patterns in relevant source files

### "Something's broken"
1. Check: DEVELOPER_GUIDE.md → Troubleshooting section
2. Verify: ARCHITECTURE_REFERENCE.md → Debugging Tips
3. Search: Source code for error messages

### "I want to deploy this"
1. Follow: DEVELOPER_GUIDE.md → Building & Deployment section
2. Choose: Vercel (recommended), Docker, or self-hosted
3. Configure: Environment variables (OPENAI_API_KEY)

---

## Documentation Statistics

| Document | Size | Lines | Purpose |
|----------|------|-------|---------|
| GUIDE_SUMMARY.md | 7.7 KB | ~300 | Overview & summary |
| DEVELOPER_GUIDE.md | 32 KB | 932 | Complete reference |
| ARCHITECTURE_REFERENCE.md | 8.2 KB | ~350 | Quick lookup |
| README.md | 864 B | 41 | Quick start |

**Total:** ~48 KB of comprehensive documentation

---

## Project at a Glance

**Type:** Next.js 14 React Application  
**Purpose:** AI-powered email campaign generator for mortgage industry  
**Key Feature:** Compliance-validated campaign copy generation  

**Tech Stack:**
- Framework: Next.js 14 + React 18
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + Framer Motion
- AI: OpenAI (gpt-4o, gpt-4o-mini)
- Validation: Zod schemas
- Testing: Vitest

**User Flow:**
1. Fill 6-step intake form
2. AI generates campaign pacing
3. AI writes campaign copy
4. Compliance validation
5. Download campaign

**Setup:**
```bash
pnpm install
cp .env.example .env.local
# Add OPENAI_API_KEY
pnpm dev
```

---

## Key Files (Quick Reference)

### Core Logic (12 files to understand)
- `/app/page.tsx` - Main orchestrator
- `/app/api/plan/route.ts` - Campaign planning
- `/app/api/write/route.ts` - Content generation
- `/app/lib/catalog/intake.ts` - Form definition & validation
- `/app/lib/campaign/validation.ts` - Compliance checking
- `/app/lib/prompts/system.ts` - LLM instructions
- `/app/components/ModernChat.tsx` - Intake form UI
- `/app/components/ModernOutput.tsx` - Campaign display
- `/app/lib/openai.ts` - OpenAI client setup
- `/app/lib/schemas/intake.ts` - Zod validation
- `/scripts/harvest-tone.ts` - CSV → JSON converter
- `/tests/*.test.ts` - Test suite (5 files)

### Config Files
- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Tailwind theme
- `next.config.mjs` - Next.js settings
- `vitest.config.ts` - Test runner config
- `.env.example` - Environment template

---

## Common Questions

**Q: Where do I start if I'm new?**
A: Read GUIDE_SUMMARY.md first (5 minutes), then follow Setup Checklist.

**Q: How does the AI part work?**
A: See DEVELOPER_GUIDE.md → "API Routes" → /api/plan and /api/write sections.

**Q: What are the compliance rules?**
A: Check ARCHITECTURE_REFERENCE.md → "Compliance Rules" section.

**Q: How do I modify the intake form?**
A: Follow DEVELOPER_GUIDE.md → "Development Workflow" → "Adding a New Intake Question"

**Q: Can I use this without OpenAI API key?**
A: Yes, /api/plan has a fallback. /api/write requires the key.

**Q: What's the cost to run this?**
A: ~2-3 cents per campaign in OpenAI API fees.

**Q: How do I test my changes?**
A: Run `pnpm test` - tests are in /tests directory.

---

## Documentation Maintenance

**Created:** November 5, 2024  
**Documentation Version:** 1.0  
**Scope:** Complete codebase analysis and developer guide  
**Included:** All source files, configuration, setup, and testing guidance  

### What's Covered
- Complete directory structure
- All configuration files explained
- Data flow diagrams
- Component documentation
- API route specifications
- Validation rules
- Setup instructions
- Development patterns
- Testing guidelines
- Deployment options
- Troubleshooting guide

### What's Not Covered
- Runtime errors (refer to server logs)
- OpenAI API changes (refer to OpenAI docs)
- Business logic specifics (refer to code comments)

---

## File Paths (Absolute)

All documentation references use these absolute paths:

```
/home/user/NFM-journey-dev/
├── DOCUMENTATION_INDEX.md (this file)
├── GUIDE_SUMMARY.md
├── DEVELOPER_GUIDE.md
├── ARCHITECTURE_REFERENCE.md
├── README.md (original)
├── app/
├── data/
├── scripts/
├── tests/
├── package.json
├── tsconfig.json
└── ... (other config files)
```

---

## Next Steps

1. **Read:** Start with GUIDE_SUMMARY.md
2. **Understand:** Skim ARCHITECTURE_REFERENCE.md
3. **Setup:** Follow DEVELOPER_GUIDE.md setup section
4. **Explore:** Read through source files with doc guides
5. **Test:** Run `pnpm test` to verify everything works
6. **Extend:** Use Development Workflow patterns to add features

---

## Support

For questions about:
- **Project Structure:** See ARCHITECTURE_REFERENCE.md
- **Setup Issues:** See DEVELOPER_GUIDE.md → Setup Instructions
- **Code Patterns:** See DEVELOPER_GUIDE.md → Development Workflow
- **Debugging:** See DEVELOPER_GUIDE.md → Troubleshooting
- **Deployment:** See DEVELOPER_GUIDE.md → Building & Deployment

---

**Documentation created:** November 5, 2024  
**Total scope:** Complete codebase analysis + developer recreation guide
