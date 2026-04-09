export const BENCHMARKS = ["ARC-AGI-2", "HLE", "HLE-Verified", "GPQA Diamond"] as const;

export type BenchmarkName = (typeof BENCHMARKS)[number];

export type StandardBenchmarkRow = {
  benchmark: Exclude<BenchmarkName, "HLE-Verified">;
  date: string;
  model: string;
  org: string;
  score: number;
};

export type VerifiedBenchmarkRow = {
  benchmark: "HLE-Verified";
  date: string;
  model: string;
  org: string;
  score: number;
  rawScore: number;
  delta: number;
};

export type BenchmarkRow = StandardBenchmarkRow | VerifiedBenchmarkRow;

export type PreparedStandardBenchmarkRow = StandardBenchmarkRow & {
  id: string;
  ts: number;
  x: number;
  y: number;
  searchText: string;
  isVerified: false;
};

export type PreparedVerifiedBenchmarkRow = VerifiedBenchmarkRow & {
  id: string;
  ts: number;
  x: number;
  y: number;
  searchText: string;
  isVerified: true;
};

export type PreparedBenchmarkRow = PreparedStandardBenchmarkRow | PreparedVerifiedBenchmarkRow;

export type FrontierPoint = {
  x: number;
  ts: number;
  frontier: number;
  frontierModel: string;
  frontierOrg: string;
  date: string;
};

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
  rowId?: string;
};

export type ValidationReport = {
  rowCount: number;
  benchmarkCount: number;
  orgCount: number;
  minDate: string | null;
  maxDate: string | null;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
};

export type SmokeTestResult = {
  passed: boolean;
  failures: string[];
  count: number;
};

export const ORG_COLORS: Record<string, string> = {
  OpenAI: "#10b981",
  Google: "#3b82f6",
  Anthropic: "#f59e0b",
  xAI: "#ef4444",
  DeepSeek: "#8b5cf6",
  Meta: "#14b8a6",
  Microsoft: "#06b6d4",
  NVIDIA: "#22c55e",
  Amazon: "#f97316",
  AI21: "#ec4899",
  Moonshot: "#a855f7",
  "z.AI": "#64748b",
  Qwen: "#7c3aed",
  LG: "#e11d48",
};

export const META: Record<BenchmarkName, { note: string; human: number | null }> = {
  "ARC-AGI-2": {
    note: "ARC-AGI-2 uses the current public leaderboard methodology with a human anchor of about 60%. This tab preserves the historical result rows already collected for the dashboard.",
    human: 60,
  },
  HLE: {
    note: "Re-audited to the current official HLE public leaderboard snapshot. Because the official page is a live leaderboard rather than a dated historical table, points are positioned using model release dates from the linked model announcements.",
    human: null,
  },
  "HLE-Verified": {
    note: "Re-audited to the HLE-Verified paper table. Unlike live leaderboards, these seven values were published together in the paper, so every point is pinned to the paper publication date (Feb 15, 2026) instead of earlier model launch dates.",
    human: null,
  },
  "GPQA Diamond": {
    note: "GPQA Diamond keeps the historical rows already collected for the dashboard, with the public PhD-expert anchor at about 65%.",
    human: 65,
  },
};

export const DATA: readonly BenchmarkRow[] = [
  // ARC-AGI-2
  { benchmark: "ARC-AGI-2", date: "2024-09-12", model: "o1 mini", org: "OpenAI", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2024-12-17", model: "o1", org: "OpenAI", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2024-12-20", model: "o3 Preview", org: "OpenAI", score: 4 },
  { benchmark: "ARC-AGI-2", date: "2025-01-20", model: "DeepSeek R1 (2025-01-20)", org: "DeepSeek", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2025-01-30", model: "o3 mini", org: "OpenAI", score: 3 },
  { benchmark: "ARC-AGI-2", date: "2025-02-24", model: "Claude 3.7 Sonnet", org: "Anthropic", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2025-02-27", model: "GPT 4.5", org: "OpenAI", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2025-03-19", model: "o1 pro", org: "OpenAI", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2025-04-14", model: "GPT 4.1", org: "OpenAI", score: 0 },
  { benchmark: "ARC-AGI-2", date: "2025-04-14", model: "GPT 4.1 Mini", org: "OpenAI", score: 0 },
  { benchmark: "ARC-AGI-2", date: "2025-04-14", model: "GPT 4.1 Nano", org: "OpenAI", score: 0 },
  { benchmark: "ARC-AGI-2", date: "2025-04-16", model: "o3", org: "OpenAI", score: 3 },
  { benchmark: "ARC-AGI-2", date: "2025-04-16", model: "o4 Mini", org: "OpenAI", score: 2 },
  { benchmark: "ARC-AGI-2", date: "2025-04-18", model: "Grok 3 Mini", org: "xAI", score: 0 },
  { benchmark: "ARC-AGI-2", date: "2025-05-16", model: "Codex Mini", org: "OpenAI", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2025-05-21", model: "Claude Opus 4", org: "Anthropic", score: 9 },
  { benchmark: "ARC-AGI-2", date: "2025-05-21", model: "Claude Sonnet 4", org: "Anthropic", score: 6 },
  { benchmark: "ARC-AGI-2", date: "2025-05-28", model: "DeepSeek R1 (2025-05-28)", org: "DeepSeek", score: 1 },
  { benchmark: "ARC-AGI-2", date: "2025-06-05", model: "Gemini 2.5 Pro Preview (2025-06-05)", org: "Google", score: 5 },
  { benchmark: "ARC-AGI-2", date: "2025-06-10", model: "o3 Pro", org: "OpenAI", score: 5 },
  { benchmark: "ARC-AGI-2", date: "2025-07-10", model: "Grok 4", org: "xAI", score: 16 },
  { benchmark: "ARC-AGI-2", date: "2025-08-07", model: "GPT 5", org: "OpenAI", score: 10 },
  { benchmark: "ARC-AGI-2", date: "2025-08-07", model: "GPT 5 Mini", org: "OpenAI", score: 4 },
  { benchmark: "ARC-AGI-2", date: "2025-08-07", model: "GPT 5 Nano", org: "OpenAI", score: 3 },
  { benchmark: "ARC-AGI-2", date: "2025-11-12", model: "GPT 5.1", org: "OpenAI", score: 18 },
  { benchmark: "ARC-AGI-2", date: "2025-11-24", model: "Claude Opus 4.5", org: "Anthropic", score: 38 },
  { benchmark: "ARC-AGI-2", date: "2025-12-01", model: "DeepSeek V3.2", org: "DeepSeek", score: 4 },
  { benchmark: "ARC-AGI-2", date: "2025-12-11", model: "GPT 5.2", org: "OpenAI", score: 53 },
  { benchmark: "ARC-AGI-2", date: "2025-12-11", model: "GPT 5.2 Pro", org: "OpenAI", score: 86 },
  { benchmark: "ARC-AGI-2", date: "2026-01-27", model: "Kimi K2.5", org: "Moonshot", score: 12 },
  { benchmark: "ARC-AGI-2", date: "2026-02-11", model: "GLM 5", org: "z.AI", score: 5 },
  { benchmark: "ARC-AGI-2", date: "2026-02-19", model: "Gemini 3.1 Pro Preview", org: "Google", score: 77 },

  // HLE (re-audited against the official public leaderboard snapshot)
  { benchmark: "HLE", date: "2024-08-06", model: "GPT 4o", org: "OpenAI", score: 2.7 },
  { benchmark: "HLE", date: "2024-12-17", model: "o1", org: "OpenAI", score: 8.0 },
  { benchmark: "HLE", date: "2025-01-20", model: "DeepSeek-R1*", org: "DeepSeek", score: 8.5 },
  { benchmark: "HLE", date: "2025-04-17", model: "Gemini 2.5 Flash", org: "Google", score: 12.1 },
  { benchmark: "HLE", date: "2025-06-05", model: "Gemini 2.5 Pro", org: "Google", score: 21.6 },
  { benchmark: "HLE", date: "2025-07-10", model: "Grok 4", org: "xAI", score: 24.5 },
  { benchmark: "HLE", date: "2025-08-07", model: "GPT-5", org: "OpenAI", score: 25.3 },
  { benchmark: "HLE", date: "2025-08-07", model: "GPT-5-mini", org: "OpenAI", score: 19.4 },
  { benchmark: "HLE", date: "2025-09-29", model: "Claude 4.5 Sonnet", org: "Anthropic", score: 13.7 },
  { benchmark: "HLE", date: "2025-11-18", model: "Gemini 3 Pro", org: "Google", score: 38.3 },

  // HLE-Verified (paper results plotted on paper publication date, not model release date)
  { benchmark: "HLE-Verified", date: "2026-02-15", model: "Gemini 3 Pro", org: "Google", score: 48.2, rawScore: 40.42, delta: 7.78 },
  { benchmark: "HLE-Verified", date: "2026-02-15", model: "Grok 4.1 Fast Reasoning", org: "xAI", score: 29, rawScore: 19.94, delta: 9.06 },
  { benchmark: "HLE-Verified", date: "2026-02-15", model: "Claude Opus 4.5", org: "Anthropic", score: 38.8, rawScore: 30, delta: 8.8 },
  { benchmark: "HLE-Verified", date: "2026-02-15", model: "DeepSeek V3.2", org: "DeepSeek", score: 36.4, rawScore: 24.9, delta: 11.5 },
  { benchmark: "HLE-Verified", date: "2026-02-15", model: "GPT-5.2 High", org: "OpenAI", score: 43.3, rawScore: 33.35, delta: 9.95 },
  { benchmark: "HLE-Verified", date: "2026-02-15", model: "Qwen3-Max-Thinking", org: "Qwen", score: 38.2, rawScore: 30, delta: 8.2 },
  { benchmark: "HLE-Verified", date: "2026-02-15", model: "Claude Opus 4.6", org: "Anthropic", score: 46.8, rawScore: 38.95, delta: 7.85 },

  // GPQA Diamond
  { benchmark: "GPQA Diamond", date: "2023-03-14", model: "GPT 4", org: "OpenAI", score: 36 },
  { benchmark: "GPQA Diamond", date: "2023-12-06", model: "Gemini 1.0 Ultra", org: "Google", score: 36 },
  { benchmark: "GPQA Diamond", date: "2023-12-06", model: "Gemini 1.0 Pro", org: "Google", score: 28 },
  { benchmark: "GPQA Diamond", date: "2024-03-04", model: "Claude 3 Opus", org: "Anthropic", score: 50 },
  { benchmark: "GPQA Diamond", date: "2024-03-04", model: "Claude 3 Sonnet", org: "Anthropic", score: 40 },
  { benchmark: "GPQA Diamond", date: "2024-03-13", model: "Claude 3 Haiku", org: "Anthropic", score: 33 },
  { benchmark: "GPQA Diamond", date: "2024-03-28", model: "Grok 1.5", org: "xAI", score: 36 },
  { benchmark: "GPQA Diamond", date: "2024-07-18", model: "GPT 4o Mini", org: "OpenAI", score: 40 },
  { benchmark: "GPQA Diamond", date: "2024-07-23", model: "Llama 3.1 405B Instruct", org: "Meta", score: 51 },
  { benchmark: "GPQA Diamond", date: "2024-07-23", model: "Llama 3.1 70B Instruct", org: "Meta", score: 42 },
  { benchmark: "GPQA Diamond", date: "2024-07-23", model: "Llama 3.1 8B Instruct", org: "Meta", score: 30 },
  { benchmark: "GPQA Diamond", date: "2024-08-06", model: "GPT 4o", org: "OpenAI", score: 46 },
  { benchmark: "GPQA Diamond", date: "2024-08-13", model: "Grok 2", org: "xAI", score: 56 },
  { benchmark: "GPQA Diamond", date: "2024-08-13", model: "Grok 2 Mini", org: "xAI", score: 51 },
  { benchmark: "GPQA Diamond", date: "2024-08-22", model: "Jamba Large 1.5", org: "AI21", score: 37 },
  { benchmark: "GPQA Diamond", date: "2024-08-22", model: "Jamba Mini 1.5", org: "AI21", score: 32 },
  { benchmark: "GPQA Diamond", date: "2024-08-23", model: "Phi 3.5 MoE Instruct", org: "Microsoft", score: 37 },
  { benchmark: "GPQA Diamond", date: "2024-08-23", model: "Phi 3.5 Mini Instruct", org: "Microsoft", score: 30 },
  { benchmark: "GPQA Diamond", date: "2024-09-12", model: "o1 preview", org: "OpenAI", score: 73 },
  { benchmark: "GPQA Diamond", date: "2024-09-12", model: "o1 mini", org: "OpenAI", score: 60 },
  { benchmark: "GPQA Diamond", date: "2024-10-22", model: "Claude 3.5 Sonnet (2024-10-22)", org: "Anthropic", score: 65 },
  { benchmark: "GPQA Diamond", date: "2024-11-04", model: "Claude 3.5 Haiku", org: "Anthropic", score: 42 },
  { benchmark: "GPQA Diamond", date: "2024-12-06", model: "Llama 3.3 70B Instruct", org: "Meta", score: 51 },
  { benchmark: "GPQA Diamond", date: "2024-12-12", model: "Phi 4", org: "Microsoft", score: 56 },
  { benchmark: "GPQA Diamond", date: "2024-12-20", model: "o3 Preview", org: "OpenAI", score: 88 },
  { benchmark: "GPQA Diamond", date: "2025-01-20", model: "DeepSeek R1 (2025-01-20)", org: "DeepSeek", score: 71 },
  { benchmark: "GPQA Diamond", date: "2025-01-30", model: "o3 mini", org: "OpenAI", score: 80 },
  { benchmark: "GPQA Diamond", date: "2025-02-05", model: "Gemini 2.0 Flash", org: "Google", score: 78 },
  { benchmark: "GPQA Diamond", date: "2025-02-19", model: "Grok 3 Beta", org: "xAI", score: 85 },
  { benchmark: "GPQA Diamond", date: "2025-02-19", model: "Grok 3 Mini Beta", org: "xAI", score: 84 },
  { benchmark: "GPQA Diamond", date: "2025-02-24", model: "Claude 3.7 Sonnet", org: "Anthropic", score: 85 },
  { benchmark: "GPQA Diamond", date: "2025-02-27", model: "GPT 4.5", org: "OpenAI", score: 71 },
  { benchmark: "GPQA Diamond", date: "2025-03-06", model: "Jamba Large 1.6", org: "AI21", score: 39 },
  { benchmark: "GPQA Diamond", date: "2025-03-06", model: "Jamba Mini 1.6", org: "AI21", score: 30 },
  { benchmark: "GPQA Diamond", date: "2025-03-12", model: "Gemma 3 27B", org: "Google", score: 42 },
  { benchmark: "GPQA Diamond", date: "2025-03-12", model: "Gemma 3 12B", org: "Google", score: 41 },
  { benchmark: "GPQA Diamond", date: "2025-03-12", model: "Gemma 3 4B", org: "Google", score: 31 },
  { benchmark: "GPQA Diamond", date: "2025-03-12", model: "Gemma 3 1B", org: "Google", score: 19 },
  { benchmark: "GPQA Diamond", date: "2025-03-18", model: "Llama 3.3 Nemotron Super 49B v1", org: "NVIDIA", score: 67 },
  { benchmark: "GPQA Diamond", date: "2025-03-25", model: "DeepSeek V3 (2025-03-24)", org: "DeepSeek", score: 68 },
  { benchmark: "GPQA Diamond", date: "2025-04-07", model: "Llama 3.1 Nemotron Ultra 253B v1", org: "NVIDIA", score: 76 },
  { benchmark: "GPQA Diamond", date: "2025-04-14", model: "GPT 4.1", org: "OpenAI", score: 66 },
  { benchmark: "GPQA Diamond", date: "2025-04-14", model: "GPT 4.1 Mini", org: "OpenAI", score: 65 },
  { benchmark: "GPQA Diamond", date: "2025-04-14", model: "GPT 4.1 Nano", org: "OpenAI", score: 50 },
  { benchmark: "GPQA Diamond", date: "2025-04-16", model: "o3", org: "OpenAI", score: 83 },
  { benchmark: "GPQA Diamond", date: "2025-04-16", model: "o4 Mini", org: "OpenAI", score: 81 },
  { benchmark: "GPQA Diamond", date: "2025-04-17", model: "Gemini 2.5 Flash Preview (2025-04-17)", org: "Google", score: 78 },
  { benchmark: "GPQA Diamond", date: "2025-04-18", model: "Grok 3", org: "xAI", score: 79 },
  { benchmark: "GPQA Diamond", date: "2025-04-18", model: "Grok 3 Mini", org: "xAI", score: 80 },
  { benchmark: "GPQA Diamond", date: "2025-04-30", model: "Phi 4 Reasoning", org: "Microsoft", score: 66 },
  { benchmark: "GPQA Diamond", date: "2025-04-30", model: "Phi 4 Reasoning Plus", org: "Microsoft", score: 69 },
  { benchmark: "GPQA Diamond", date: "2025-04-30", model: "Phi 4 Mini Reasoning", org: "Microsoft", score: 52 },
  { benchmark: "GPQA Diamond", date: "2025-04-30", model: "Nova Premier", org: "Amazon", score: 57 },
  { benchmark: "GPQA Diamond", date: "2025-05-06", model: "Gemini 2.5 Pro Preview (2025-05-06)", org: "Google", score: 83 },
  { benchmark: "GPQA Diamond", date: "2025-05-20", model: "Gemini 2.5 Flash Preview (2025-05-20)", org: "Google", score: 83 },
  { benchmark: "GPQA Diamond", date: "2025-05-21", model: "Claude Sonnet 4", org: "Anthropic", score: 84 },
  { benchmark: "GPQA Diamond", date: "2025-05-21", model: "Claude Opus 4", org: "Anthropic", score: 83 },
  { benchmark: "GPQA Diamond", date: "2025-05-28", model: "DeepSeek R1 (2025-05-28)", org: "DeepSeek", score: 81 },
  { benchmark: "GPQA Diamond", date: "2025-06-05", model: "Gemini 2.5 Pro Preview (2025-06-05)", org: "Google", score: 86 },
  { benchmark: "GPQA Diamond", date: "2025-07-10", model: "Grok 4 Heavy", org: "xAI", score: 89 },
  { benchmark: "GPQA Diamond", date: "2025-07-10", model: "Grok 4", org: "xAI", score: 88 },
  { benchmark: "GPQA Diamond", date: "2025-07-15", model: "EXAONE 4.0 32B", org: "LG", score: 75 },
  { benchmark: "GPQA Diamond", date: "2025-07-15", model: "EXAONE 4.0 1.2B", org: "LG", score: 52 },
  { benchmark: "GPQA Diamond", date: "2025-08-05", model: "GPT OSS 120b", org: "OpenAI", score: 81 },
  { benchmark: "GPQA Diamond", date: "2025-08-05", model: "GPT OSS 20b", org: "OpenAI", score: 74 },
  { benchmark: "GPQA Diamond", date: "2025-08-05", model: "Claude Opus 4.1", org: "Anthropic", score: 81 },
  { benchmark: "GPQA Diamond", date: "2025-08-07", model: "GPT 5", org: "OpenAI", score: 87 },
  { benchmark: "GPQA Diamond", date: "2025-08-07", model: "GPT 5 Mini", org: "OpenAI", score: 82 },
  { benchmark: "GPQA Diamond", date: "2025-11-24", model: "Claude Opus 4.5", org: "Anthropic", score: 87 },
  { benchmark: "GPQA Diamond", date: "2025-12-01", model: "DeepSeek V3.2 Speciale", org: "DeepSeek", score: 86 },
  { benchmark: "GPQA Diamond", date: "2025-12-02", model: "Nova 2 Pro", org: "Amazon", score: 81 },
  { benchmark: "GPQA Diamond", date: "2025-12-02", model: "Nova 2 Lite", org: "Amazon", score: 80 },
  { benchmark: "GPQA Diamond", date: "2025-12-11", model: "GPT 5.2", org: "OpenAI", score: 92 },
  { benchmark: "GPQA Diamond", date: "2025-12-11", model: "GPT 5.2 Pro", org: "OpenAI", score: 93 },
  { benchmark: "GPQA Diamond", date: "2026-02-19", model: "Gemini 3.1 Pro Preview", org: "Google", score: 94 },
  { benchmark: "GPQA Diamond", date: "2026-03-03", model: "Gemini 3.1 Flash Lite Preview", org: "Google", score: 87 },
];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function isVerifiedRow(row: BenchmarkRow): row is VerifiedBenchmarkRow;
export function isVerifiedRow(row: PreparedBenchmarkRow): row is PreparedVerifiedBenchmarkRow;
export function isVerifiedRow(
  row: BenchmarkRow | PreparedBenchmarkRow,
): row is VerifiedBenchmarkRow | PreparedVerifiedBenchmarkRow {
  return row.benchmark === "HLE-Verified";
}

export function parseIsoDateUtc(date: string): number {
  if (!ISO_DATE_RE.test(date)) {
    throw new Error(`Invalid ISO date format: ${date}`);
  }

  const [yearText, monthText, dayText] = date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const ts = Date.UTC(year, month - 1, day);
  const parsed = new Date(ts);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${date}`);
  }

  return ts;
}

export function formatIsoDateUtc(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function fmtMonth(ts: number): string {
  return MONTH_FORMATTER.format(ts);
}

export function fmtDate(value: number | string): string {
  const ts = typeof value === "number" ? value : parseIsoDateUtc(value);
  return DATE_FORMATTER.format(ts);
}

function isFiniteScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function validateAndPrepareData(
  rows: readonly BenchmarkRow[],
  orgColors: Record<string, string>,
): { rows: PreparedBenchmarkRow[]; report: ValidationReport } {
  const issues: ValidationIssue[] = [];
  const prepared: PreparedBenchmarkRow[] = [];
  const seenIds = new Set<string>();
  const benchmarkSet = new Set<BenchmarkName>();
  const orgSet = new Set<string>();
  let minTs: number | null = null;
  let maxTs: number | null = null;

  for (const row of rows) {
    const id = `${row.benchmark}|${row.date}|${row.org}|${row.model}`;

    if (seenIds.has(id)) {
      issues.push({ level: "error", message: `Duplicate row id detected: ${id}`, rowId: id });
      continue;
    }
    seenIds.add(id);

    let ts: number;
    try {
      ts = parseIsoDateUtc(row.date);
    } catch (error) {
      issues.push({
        level: "error",
        message: error instanceof Error ? error.message : `Invalid date: ${row.date}`,
        rowId: id,
      });
      continue;
    }

    if (!isFiniteScore(row.score)) {
      issues.push({
        level: "error",
        message: `Score must be a finite percentage between 0 and 100: ${row.score}`,
        rowId: id,
      });
      continue;
    }

    if (!META[row.benchmark]) {
      issues.push({ level: "error", message: `Missing benchmark metadata for ${row.benchmark}.`, rowId: id });
      continue;
    }

    if (!orgColors[row.org]) {
      issues.push({ level: "warning", message: `Missing organization color for ${row.org}.`, rowId: id });
    }

    if (isVerifiedRow(row)) {
      if (!isFiniteScore(row.rawScore)) {
        issues.push({ level: "error", message: `Invalid rawScore for ${id}.`, rowId: id });
        continue;
      }

      if (!Number.isFinite(row.delta)) {
        issues.push({ level: "error", message: `Invalid delta for ${id}.`, rowId: id });
        continue;
      }

      if (roundToTenth(row.rawScore + row.delta) !== roundToTenth(row.score)) {
        issues.push({
          level: "warning",
          message: `Verified score does not match rawScore + delta for ${id}.`,
          rowId: id,
        });
      }
    }

    benchmarkSet.add(row.benchmark);
    orgSet.add(row.org);
    minTs = minTs === null ? ts : Math.min(minTs, ts);
    maxTs = maxTs === null ? ts : Math.max(maxTs, ts);

    if (isVerifiedRow(row)) {
      prepared.push({
        ...row,
        id,
        ts,
        x: ts,
        y: row.score,
        searchText: `${row.model} ${row.org} ${row.benchmark}`.toLocaleLowerCase(),
        isVerified: true,
      });
    } else {
      prepared.push({
        ...row,
        id,
        ts,
        x: ts,
        y: row.score,
        searchText: `${row.model} ${row.org} ${row.benchmark}`.toLocaleLowerCase(),
        isVerified: false,
      });
    }
  }

  for (const benchmark of BENCHMARKS) {
    if (!prepared.some((row) => row.benchmark === benchmark)) {
      issues.push({ level: "error", message: `Benchmark ${benchmark} has no rows.` });
    }
  }

  for (const benchmark of BENCHMARKS) {
    const benchmarkRows = prepared.filter((row) => row.benchmark === benchmark);
    const originalRows = rows.filter((row) => row.benchmark === benchmark);

    for (let index = 1; index < originalRows.length; index += 1) {
      const previousTs = parseIsoDateUtc(originalRows[index - 1].date);
      const currentTs = parseIsoDateUtc(originalRows[index].date);
      if (currentTs < previousTs) {
        issues.push({
          level: "warning",
          message: `Rows for ${benchmark} are not in chronological order at index ${index}.`,
        });
        break;
      }
    }

    if (benchmarkRows.length > 0 && META[benchmark].human !== null) {
      const human = META[benchmark].human;
      if (!isFiniteScore(human)) {
        issues.push({ level: "error", message: `Human anchor for ${benchmark} is invalid.` });
      }
    }
  }

  const verifiedDates = new Set(
    prepared
      .filter((row) => row.benchmark === "HLE-Verified")
      .map((row) => row.date),
  );
  if (verifiedDates.size > 1) {
    issues.push({
      level: "warning",
      message: "HLE-Verified rows are expected to share one publication date.",
    });
  }

  prepared.sort((a, b) => a.ts - b.ts || b.score - a.score || a.model.localeCompare(b.model));

  return {
    rows: prepared,
    report: {
      rowCount: prepared.length,
      benchmarkCount: benchmarkSet.size,
      orgCount: orgSet.size,
      minDate: minTs === null ? null : formatIsoDateUtc(minTs),
      maxDate: maxTs === null ? null : formatIsoDateUtc(maxTs),
      errorCount: issues.filter((issue) => issue.level === "error").length,
      warningCount: issues.filter((issue) => issue.level === "warning").length,
      issues,
    },
  };
}

export const DATASET = validateAndPrepareData(DATA, ORG_COLORS);
export const DATASET_VALIDATION = DATASET.report;
export const PREPARED_DATA = DATASET.rows;

export function getOrganizationsForBenchmark(
  benchmark: BenchmarkName,
  rows: readonly PreparedBenchmarkRow[] = PREPARED_DATA,
): string[] {
  return [
    "All",
    ...Array.from(new Set(rows.filter((row) => row.benchmark === benchmark).map((row) => row.org))).sort((a, b) =>
      a.localeCompare(b),
    ),
  ];
}

export function getScopedData(
  selectedBenchmark: BenchmarkName,
  orgFilter: string,
  query: string,
  rows: readonly PreparedBenchmarkRow[] = PREPARED_DATA,
): PreparedBenchmarkRow[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return rows
    .filter((row) => row.benchmark === selectedBenchmark)
    .filter((row) => (orgFilter === "All" ? true : row.org === orgFilter))
    .filter((row) => (normalizedQuery ? row.searchText.includes(normalizedQuery) : true))
    .sort((a, b) => a.ts - b.ts || b.score - a.score || a.model.localeCompare(b.model));
}

export function groupRowsByOrg(
  rows: readonly PreparedBenchmarkRow[],
): Array<{ org: string; rows: PreparedBenchmarkRow[] }> {
  const grouped = new Map<string, PreparedBenchmarkRow[]>();

  for (const row of rows) {
    if (!grouped.has(row.org)) {
      grouped.set(row.org, []);
    }
    grouped.get(row.org)?.push(row);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([org, orgRows]) => ({ org, rows: orgRows }));
}

export function getFrontierData(rows: readonly PreparedBenchmarkRow[]): FrontierPoint[] {
  let best = Number.NEGATIVE_INFINITY;
  let bestModel = "";
  let bestOrg = "";

  return rows.map((row) => {
    if (row.score > best) {
      best = row.score;
      bestModel = row.model;
      bestOrg = row.org;
    }

    return {
      x: row.x,
      ts: row.ts,
      frontier: best,
      frontierModel: bestModel,
      frontierOrg: bestOrg,
      date: row.date,
    };
  });
}

export function getHumanCrossing(
  rows: readonly PreparedBenchmarkRow[],
  human: number | null,
): PreparedBenchmarkRow | null {
  if (human === null) {
    return null;
  }

  let frontier = Number.NEGATIVE_INFINITY;
  for (const row of rows) {
    if (row.score > frontier) {
      frontier = row.score;
      if (frontier >= human) {
        return row;
      }
    }
  }

  return null;
}

export function getXDomain(rows: readonly PreparedBenchmarkRow[]): [number, number] {
  if (rows.length === 0) {
    const fallback = parseIsoDateUtc("2024-01-01");
    return [fallback - 30 * DAY_MS, fallback + 30 * DAY_MS];
  }

  const min = rows[0].ts;
  const max = rows[rows.length - 1].ts;
  if (min === max) {
    return [min - 14 * DAY_MS, max + 14 * DAY_MS];
  }

  const pad = Math.max(14 * DAY_MS, Math.round((max - min) * 0.04));
  return [min - pad, max + pad];
}

export function runSmokeTests(): SmokeTestResult {
  const failures: string[] = [];

  if (BENCHMARKS.length !== 4) {
    failures.push("Expected exactly 4 benchmark tabs.");
  }

  if (ORG_COLORS["z.AI"] !== "#64748b") {
    failures.push('Expected ORG_COLORS to include the quoted key "z.AI".');
  }

  if (DATASET_VALIDATION.errorCount !== 0) {
    failures.push(`Dataset validation found ${DATASET_VALIDATION.errorCount} blocking errors.`);
  }

  const arcRows = getScopedData("ARC-AGI-2", "All", "");
  if (arcRows.length === 0) {
    failures.push("ARC-AGI-2 should have visible rows.");
  }

  const filteredRows = getScopedData("GPQA Diamond", "OpenAI", "gpt 5.2");
  if (!filteredRows.some((row) => row.model === "GPT 5.2")) {
    failures.push("Model text filtering should find GPT 5.2 in GPQA Diamond.");
  }

  if (!filteredRows.every((row) => typeof row.x === "number" && typeof row.y === "number")) {
    failures.push("Scatter rows should include explicit numeric x/y values for the timeline.");
  }

  const frontier = getFrontierData([
    {
      benchmark: "HLE",
      date: "2025-01-01",
      model: "A",
      org: "OpenAI",
      score: 10,
      id: "A",
      ts: parseIsoDateUtc("2025-01-01"),
      x: parseIsoDateUtc("2025-01-01"),
      y: 10,
      searchText: "a openai hle",
      isVerified: false,
    },
    {
      benchmark: "HLE",
      date: "2025-01-02",
      model: "B",
      org: "OpenAI",
      score: 8,
      id: "B",
      ts: parseIsoDateUtc("2025-01-02"),
      x: parseIsoDateUtc("2025-01-02"),
      y: 8,
      searchText: "b openai hle",
      isVerified: false,
    },
    {
      benchmark: "HLE",
      date: "2025-01-03",
      model: "C",
      org: "OpenAI",
      score: 14,
      id: "C",
      ts: parseIsoDateUtc("2025-01-03"),
      x: parseIsoDateUtc("2025-01-03"),
      y: 14,
      searchText: "c openai hle",
      isVerified: false,
    },
  ]);
  if (frontier[0]?.frontier !== 10 || frontier[1]?.frontier !== 10 || frontier[2]?.frontier !== 14) {
    failures.push("Frontier line should be monotonic and retain the best-so-far score.");
  }

  const verifiedRows = getScopedData("HLE-Verified", "All", "");
  if (!verifiedRows.every((row) => row.isVerified && typeof row.rawScore === "number" && typeof row.delta === "number")) {
    failures.push("HLE-Verified rows should include rawScore and delta.");
  }

  if (!verifiedRows.every((row) => row.date === "2026-02-15")) {
    failures.push("HLE-Verified points should be pinned to the paper publication date.");
  }

  const crossing = getHumanCrossing(
    [
      {
        benchmark: "GPQA Diamond",
        date: "2024-01-01",
        model: "Below",
        org: "OpenAI",
        score: 60,
        id: "Below",
        ts: parseIsoDateUtc("2024-01-01"),
        x: parseIsoDateUtc("2024-01-01"),
        y: 60,
        searchText: "below openai gpqa diamond",
        isVerified: false,
      },
      {
        benchmark: "GPQA Diamond",
        date: "2024-01-02",
        model: "Cross",
        org: "OpenAI",
        score: 66,
        id: "Cross",
        ts: parseIsoDateUtc("2024-01-02"),
        x: parseIsoDateUtc("2024-01-02"),
        y: 66,
        searchText: "cross openai gpqa diamond",
        isVerified: false,
      },
      {
        benchmark: "GPQA Diamond",
        date: "2024-01-03",
        model: "Later",
        org: "OpenAI",
        score: 80,
        id: "Later",
        ts: parseIsoDateUtc("2024-01-03"),
        x: parseIsoDateUtc("2024-01-03"),
        y: 80,
        searchText: "later openai gpqa diamond",
        isVerified: false,
      },
    ],
    65,
  );
  if (crossing?.model !== "Cross") {
    failures.push("Human threshold crossing should mark the first frontier point at or above the human anchor.");
  }

  const hleRows = getScopedData("HLE", "All", "");
  if (!hleRows.some((row) => row.model === "Gemini 3 Pro" && row.score === 38.3)) {
    failures.push("HLE should contain the official Gemini 3 Pro public leaderboard value.");
  }

  let invalidDateWasRejected = false;
  try {
    parseIsoDateUtc("2025-02-30");
  } catch {
    invalidDateWasRejected = true;
  }
  if (!invalidDateWasRejected) {
    failures.push("Invalid calendar dates should be rejected.");
  }

  const domain = getXDomain([{ ...arcRows[0] }]);
  if (!(domain[0] < domain[1])) {
    failures.push("Single-point x domains should still include chart padding.");
  }

  return {
    passed: failures.length === 0,
    failures,
    count: 12,
  };
}

export const TEST_RESULTS = runSmokeTests();
