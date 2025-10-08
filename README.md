# newfed-campaign-builder

Tiny stateless planner that interviews a marketer, calls OpenAI to build a Total Expert-ready journey, and outputs the full campaign copy.

## Getting started

```bash
pnpm install
```

Create a `.env.local` with your `OPENAI_API_KEY`.

```bash
cp .env.example .env.local
```

Add the provided catalog file to `data/newfed_catalog.csv`, then harvest tone snippets:

```bash
pnpm tsx scripts/harvest-tone.ts --in data/newfed_catalog.csv --out app/lib/catalog/tone.json
```

Run the app locally:

```bash
pnpm dev
```

Open `http://localhost:3000` to step through the intake. The app sends responses to:

- `POST /api/plan` (model: `gpt-4o-mini`)
- `POST /api/write` (model: `gpt-4o`)

## Tests & validation

```bash
pnpm test
```

The suite covers intake validation helpers and campaign formatting checks to catch compliance regressions.
