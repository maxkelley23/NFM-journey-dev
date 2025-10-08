import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "OPENAI_API_KEY is not set. API routes that rely on OpenAI will fail."
  );
}

export const openai = new OpenAI({
  apiKey
});

export const hasOpenAICredentials = Boolean(apiKey);
