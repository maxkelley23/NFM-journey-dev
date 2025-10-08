export const DEFAULT_DELAYS = [1, 4, 7, 11, 17, 24, 33, 45];
export const DEFAULT_SMS_STEPS = [3, 7];
export const SUBJECT_MAX = 55;
export const PREHEADER_MAX = 90;
export const BANNED_PATTERNS = [
  /\bguarantee(d)?\b/i,
  /\bpre-?approved\b/i,
  // allow the words "rate"/"rates"/"apr" in general context, but block numerical quoting like "X.% APR" or "$X at X%":
  /\b\d{1,2}\.?\d{0,2}\s?%\b/i,
  /\bAPR\s?\d/i
];
