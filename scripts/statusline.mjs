// BurnBoard Statusline HUD for Claude Code
// Displays monthly token usage, tier, and progress in the terminal statusline.

import { readFileSync, writeFileSync, statSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ── Data directory & config ──────────────────────────────────────────────────

function dataDir() {
  if (process.env.CLAUDE_PLUGIN_DATA) return process.env.CLAUDE_PLUGIN_DATA;
  // Check Claude Code plugin data directory first
  const claudePluginDir = join(homedir(), ".claude", "plugins", "data", "burnboard-burnboard-marketplace");
  if (existsSync(join(claudePluginDir, "config.json"))) return claudePluginDir;
  return join(homedir(), ".burnboard");
}

function readConfig() {
  const p = join(dataDir(), "config.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

// ── Tier definitions ─────────────────────────────────────────────────────────

const TIERS = [
  { name: "Spark",     min: 0,         max: 1_000_000,   icon: "✦", color: "\x1b[2m" },
  { name: "Ember",     min: 1_000_000, max: 5_000_000,   icon: "🔶", color: "\x1b[38;5;208m" },
  { name: "Flame",     min: 5_000_000, max: 20_000_000,  icon: "🔥", color: "\x1b[38;5;196m" },
  { name: "Blaze",     min: 20_000_000, max: 50_000_000, icon: "💥", color: "\x1b[91m" },
  { name: "Inferno",   min: 50_000_000, max: 100_000_000, icon: "🌋", color: "\x1b[35m" },
  { name: "Supernova", min: 100_000_000, max: Infinity,  icon: "⭐", color: "\x1b[1;33m" },
];

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

function getTier(tokens) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (tokens >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

function getNextTier(tokens) {
  for (const tier of TIERS) {
    if (tokens < tier.max) return tier;
  }
  return TIERS[TIERS.length - 1];
}

// ── Token formatting ─────────────────────────────────────────────────────────

function formatTokens(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function progressBar(current, min, max, width = 10) {
  if (max === Infinity) return "█".repeat(width);
  const range = max - min;
  if (range <= 0) return "█".repeat(width);
  const pct = Math.min(1, Math.max(0, (current - min) / range));
  const filled = Math.round(pct * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function progressPct(current, min, max) {
  if (max === Infinity) return 100;
  const range = max - min;
  if (range <= 0) return 100;
  return Math.min(100, Math.round(((current - min) / range) * 100));
}

// ── Transcript parser (inlined from flush.mjs) ──────────────────────────────

function parseTranscriptTokens(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    let total = 0;
    for (const line of lines) {
      let entry;
      try { entry = JSON.parse(line); } catch { continue; }
      const usage = entry?.message?.usage;
      if (!usage) continue;
      total += (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0);
    }
    return total;
  } catch {
    return 0;
  }
}

// ── Cache management ─────────────────────────────────────────────────────────

function cachePath() {
  return join(dataDir(), "hud-cache.json");
}

function readCache() {
  try {
    return JSON.parse(readFileSync(cachePath(), "utf-8"));
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    writeFileSync(cachePath(), JSON.stringify(data));
  } catch {
    // silently fail
  }
}

// ── Monthly summary ──────────────────────────────────────────────────────────

function readMonthlySummary() {
  const p = join(dataDir(), "monthly-summary.json");
  try {
    const data = JSON.parse(readFileSync(p, "utf-8"));
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (data.month === currentMonth) return data;
    return null;
  } catch {
    return null;
  }
}

// ── Stdin reader ─────────────────────────────────────────────────────────────

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8").trim();
      try { resolve(JSON.parse(raw)); } catch { resolve(null); }
    });
    process.stdin.on("error", () => resolve(null));
  });
}

// ── Render ───────────────────────────────────────────────────────────────────

function render(monthlyTokens, sessionTokens) {
  const tier = getTier(monthlyTokens);
  const nextTier = getNextTier(monthlyTokens);
  const bar = progressBar(monthlyTokens, tier.min, nextTier.max);
  const pct = progressPct(monthlyTokens, tier.min, nextTier.max);

  const tierLabel = `${tier.color}${tier.icon} ${tier.name}${RESET}`;
  const tokenLabel = `${formatTokens(monthlyTokens)}/${formatTokens(nextTier.max)}`;
  const barLabel = `${tier.color}${bar}${RESET} ${pct}%`;
  const sessionLabel = `${DIM}Session:${RESET} ${formatTokens(sessionTokens)}`;

  return `${tierLabel}  ${tokenLabel} ${barLabel}  │  ${sessionLabel}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const config = readConfig();
  if (!config) {
    console.log(`${DIM}BurnBoard: run /burnboard:setup${RESET}`);
    return;
  }

  const stdin = await readStdin();
  if (!stdin) return;

  const transcriptPath = stdin.transcript_path ?? "";
  const now = Date.now();

  // Check cache
  const cache = readCache();
  if (
    cache &&
    cache.transcriptPath === transcriptPath &&
    (now - cache.updatedAt) < 5000
  ) {
    console.log(render(cache.monthlyTokens, cache.sessionTokens));
    return;
  }

  // Parse current session tokens
  let sessionTokens = 0;
  let transcriptSize = 0;
  if (transcriptPath) {
    try {
      const stat = statSync(transcriptPath);
      transcriptSize = stat.size;
      // If transcript size hasn't changed and we have cache, reuse session tokens
      if (cache && cache.transcriptPath === transcriptPath && cache.transcriptSize === transcriptSize) {
        sessionTokens = cache.sessionTokens;
      } else {
        sessionTokens = parseTranscriptTokens(transcriptPath);
      }
    } catch {
      sessionTokens = cache?.sessionTokens ?? 0;
    }
  }

  // Read monthly summary
  const summary = readMonthlySummary();
  const monthlyBase = summary?.totalTokens ?? 0;
  const monthlyTokens = monthlyBase + sessionTokens;

  // Update cache
  writeCache({
    updatedAt: now,
    monthlyTokens,
    currentMonth: new Date().toISOString().slice(0, 7),
    sessionTokens,
    transcriptSize,
    transcriptPath,
  });

  console.log(render(monthlyTokens, sessionTokens));
}

main().catch(() => {});
