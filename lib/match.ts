import Fuse from "fuse.js";

export type EntryType = "phone" | "business" | "name" | "social";

export function detectType(raw: string): EntryType {
  const v = raw.trim();
  if (!v) return "name";
  if (v.startsWith("@")) return "social";
  const digits = v.replace(/[^\d]/g, "");
  const compact = v.replace(/\s/g, "");
  if (digits.length >= 7 && digits.length / Math.max(compact.length, 1) > 0.6) return "phone";
  return "name";
}

export function normalize(raw: string, type: EntryType) {
  if (type === "phone") return raw.replace(/[^\d]/g, "");
  return raw.trim().toLowerCase();
}

/** Classic edit distance — used to catch typos, missing digits, and swapped country codes. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Phone comparison that tolerates country-code formatting differences
 * (e.g. "0712345678" vs "+254712345678") by comparing the last 9 digits,
 * then falls back to edit distance for near-miss typos.
 */
export function phoneMatch(query: string, candidate: string): { exact: boolean; score: number } {
  const q = query.replace(/[^\d]/g, "");
  const c = candidate.replace(/[^\d]/g, "");
  if (!q || !c) return { exact: false, score: 0 };
  if (q === c) return { exact: true, score: 1 };

  const qTail = q.slice(-9);
  const cTail = c.slice(-9);
  if (qTail === cTail && qTail.length === 9) return { exact: true, score: 0.97 };

  const dist = levenshtein(qTail, cTail);
  const score = 1 - dist / Math.max(qTail.length, cTail.length, 1);
  return { exact: false, score };
}

/** Fuzzy text search over business names, people names, and social handles. */
export function fuzzyTextSearch<T>(query: string, items: T[], keys: string[]) {
  if (items.length === 0) return [];
  const fuse = new Fuse(items, { keys, threshold: 0.4, includeScore: true, ignoreLocation: true });
  return fuse.search(query).map((r) => ({ item: r.item, score: 1 - (r.score ?? 1) }));
}
