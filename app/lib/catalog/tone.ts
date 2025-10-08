import toneData from "./tone.json";

export type ToneSnippet = {
  id: string;
  text: string;
  audiences: string[];
  purposes: string[];
};

const snippets = toneData as ToneSnippet[];

const normalize = (value: string) => value.toLowerCase();

export const selectToneSnippets = (options: {
  audience: string;
  purposes: string[];
  limit?: number;
}) => {
  const audienceTokens = tokenize(options.audience);
  const purposeTokens = options.purposes.map(normalize);
  const scored = snippets
    .map((snippet) => {
      const audienceScore = snippet.audiences.some((aud) =>
        audienceTokens.includes(normalize(aud))
      )
        ? 2
        : snippet.audiences.includes("general")
        ? 1
        : 0;
      const purposeScore = snippet.purposes.some((purpose) =>
        purposeTokens.includes(normalize(purpose))
      )
        ? 2
        : snippet.purposes.includes("general")
        ? 1
        : 0;
      return {
        snippet,
        score: audienceScore + purposeScore
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const limit = options.limit ?? 6;
  const results = scored.slice(0, limit).map((entry) => entry.snippet);

  if (results.length >= 3) {
    return results;
  }

  const topUp = snippets
    .filter(
      (snippet) =>
        !results.some((selected) => selected.id === snippet.id)
    )
    .slice(0, Math.max(0, 3 - results.length));

  return [...results, ...topUp].slice(0, limit);
};

const tokenize = (value: string) =>
  value
    .split(/[,\s]+/)
    .map(normalize)
    .filter(Boolean);
