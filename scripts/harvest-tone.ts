#!/usr/bin/env tsx
import { promises as fs } from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { createHash } from "crypto";

type CsvRow = Record<string, string>;

type Snippet = {
  id: string;
  text: string;
  audiences: string[];
  purposes: string[];
  score: number;
};

const REQUIRED_COLUMNS = ["Journey Name"];
const EMAIL_COLUMN_PREFIX = "Email ";
const MIN_WORDS = 6;
const MAX_WORDS = 25;
const BOOST_PHRASES = [
  /we'?re here as a resource/i,
  /know your options/i,
  /here'?s what to expect/i,
  /a quick way to think about/i,
  /if you'?re exploring/i,
  /next steps/i,
  /walk you through/i,
  /we can outline/i
];
const PENALTY_PHRASES = [
  /act now/i,
  /limited time/i,
  /lowest rate/i,
  /guarantee/i,
  /pre-?approved/i
];

const AUDIENCE_TAGS: Array<{ id: string; pattern: RegExp }> = [
  { id: "first-time-buyers", pattern: /first-?time/i },
  { id: "refinance", pattern: /refi|refinance/i },
  { id: "investors", pattern: /invest(or|ment)/i },
  { id: "veterans", pattern: /\bVA\b|\bmilitary\b/i },
  { id: "self-employed", pattern: /self-employed|entrepreneur/i }
];

const PURPOSE_TAGS: Array<{ id: string; pattern: RegExp }> = [
  { id: "set-expectations", pattern: /expect|timeline|process/i },
  { id: "soft-cta", pattern: /ready|explore|reach out|let us know/i },
  { id: "educate", pattern: /learn|understand|guide|explainer/i },
  { id: "social-proof", pattern: /clients|stories|confidence|trust/i },
  { id: "value-recap", pattern: /recap|summary|review/i }
];

const args = process.argv.slice(2);
const inputPath = getArg(args, "--in");
const outputPath = getArg(args, "--out") ?? path.resolve("app/lib/catalog/tone.json");

if (!inputPath) {
  console.error("Please provide --in path to the catalog CSV.");
  process.exit(1);
}

async function main() {
  const csvContent = await fs.readFile(inputPath, "utf8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  }) as CsvRow[];

  validateColumns(records);

  const snippets = collectSnippets(records);
  const grouped = pickTopSnippets(snippets);
  const output = grouped.map(({ id, text, audiences, purposes }) => ({
    id,
    text,
    audiences: audiences.length ? audiences : ["general"],
    purposes: purposes.length ? purposes : ["general"]
  }));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`Saved ${output.length} snippets to ${outputPath}`);
}

function validateColumns(records: CsvRow[]) {
  if (!records.length) {
    throw new Error("No rows found in CSV.");
  }

  const columns = Object.keys(records[0] ?? {});
  REQUIRED_COLUMNS.forEach((column) => {
    if (!columns.includes(column)) {
      throw new Error(`Missing required column: ${column}`);
    }
  });

  const hasEmailColumn = columns.some((column) => column.startsWith(EMAIL_COLUMN_PREFIX));
  if (!hasEmailColumn) {
    throw new Error("CSV does not contain any Email columns.");
  }
}

function collectSnippets(records: CsvRow[]) {
  const snippets = new Map<string, Snippet>();

  records.forEach((row) => {
    Object.entries(row).forEach(([column, value]) => {
      if (!column.startsWith(EMAIL_COLUMN_PREFIX)) return;
      if (!value) return;

      splitSentences(value).forEach((sentence) => {
        const trimmed = sentence.trim();
        if (!isValidSentence(trimmed)) return;

        const audiences = tagAudience(trimmed);
        const purposes = tagPurpose(trimmed);
        const score = scoreSentence(trimmed);
        const hash = fingerprint(trimmed);

        if (!snippets.has(hash) || (snippets.get(hash)?.score ?? 0) < score) {
          snippets.set(hash, {
            id: hash,
            text: trimmed,
            audiences: audiences.length ? audiences : ["general"],
            purposes: purposes.length ? purposes : ["general"],
            score
          });
        }
      });
    });
  });

  return Array.from(snippets.values());
}

function pickTopSnippets(snippets: Snippet[]) {
  const buckets = new Map<string, Snippet[]>();

  snippets.forEach((snippet) => {
    snippet.audiences.forEach((audience) => {
      snippet.purposes.forEach((purpose) => {
        const key = `${audience}::${purpose}`;
        const list = buckets.get(key) ?? [];
        list.push(snippet);
        buckets.set(key, list);
      });
    });
  });

  const selected = new Map<string, Snippet>();

  buckets.forEach((items) => {
    const sorted = items
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    sorted.forEach((snippet) => {
      selected.set(snippet.id, snippet);
    });
  });

  if (selected.size === 0) {
    snippets
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .forEach((snippet) => selected.set(snippet.id, snippet));
  }

  return Array.from(selected.values());
}

function splitSentences(text: string) {
  return text
    .replace(/\r?\n+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function isValidSentence(sentence: string) {
  const words = sentence.split(/\s+/);
  if (words.length < MIN_WORDS || words.length > MAX_WORDS) {
    return false;
  }

  if (/https?:\/\//i.test(sentence) || /\bwww\./i.test(sentence)) return false;
  if (/\$[\d,]+/.test(sentence)) return false;
  if (/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(sentence)) return false;
  if (/\b\d{4}\b/.test(sentence)) return false;
  if (/\d/.test(sentence)) return false;
  if (/NMLS|equal housing|eho\s+logo/i.test(sentence)) return false;

  const mergeFields = sentence.match(/{{([^}]+)}}/g);
  if (mergeFields) {
    const allowed = new Set(["{{recipient.f_name}}"]);
    const hasUnsupported = mergeFields.some((field) => !allowed.has(field));
    if (hasUnsupported) return false;
  }

  return true;
}

function scoreSentence(sentence: string) {
  let score = 1;
  BOOST_PHRASES.forEach((pattern) => {
    if (pattern.test(sentence)) score += 2;
  });
  PENALTY_PHRASES.forEach((pattern) => {
    if (pattern.test(sentence)) score -= 1.5;
  });
  return score;
}

function tagAudience(sentence: string) {
  const tags = AUDIENCE_TAGS.filter(({ pattern }) => pattern.test(sentence)).map(({ id }) => id);
  return tags.length ? tags : ["general"];
}

function tagPurpose(sentence: string) {
  const tags = PURPOSE_TAGS.filter(({ pattern }) => pattern.test(sentence)).map(({ id }) => id);
  return tags.length ? tags : ["general"];
}

function fingerprint(sentence: string) {
  const normalized = sentence.toLowerCase().replace(/[^a-z\s]/g, "");
  return createHash("md5").update(normalized).digest("hex");
}

function getArg(args: string[], flag: string) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return undefined;
  return path.resolve(args[index + 1] ?? "");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
