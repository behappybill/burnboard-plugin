// src/flush-entry.ts
import { readdirSync, readFileSync as readFileSync3, unlinkSync, statSync, writeFileSync, existsSync } from "fs";
import { join as join2 } from "path";

// src/config.ts
import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
var DEFAULT_ENDPOINT = "https://burnboard.io/api";
function dataDir(overrideDir) {
  if (overrideDir) return overrideDir;
  return process.env.CLAUDE_PLUGIN_DATA ?? join(homedir(), ".burnboard");
}
function configPath(overrideDir) {
  return join(dataDir(overrideDir), "config.json");
}
function getEndpoint(config) {
  return config.endpoint ?? process.env.BURNBOARD_ENDPOINT ?? DEFAULT_ENDPOINT;
}
function readConfig(overrideDir) {
  const path = configPath(overrideDir);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

// src/transcript-parser.ts
import { readFileSync as readFileSync2 } from "fs";
function parseTranscript(filePath) {
  const content = readFileSync2(filePath, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean);
  let inputTokens = 0;
  let outputTokens = 0;
  let turnCount = 0;
  const models = {};
  const timestamps = [];
  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.timestamp) {
      timestamps.push(new Date(entry.timestamp));
    }
    const usage = entry?.message?.usage;
    if (!usage) continue;
    const input = usage.input_tokens ?? 0;
    const output = usage.output_tokens ?? 0;
    inputTokens += input;
    outputTokens += output;
    turnCount++;
    const model = entry?.message?.model ?? "unknown";
    models[model] = (models[model] ?? 0) + input + output;
  }
  timestamps.sort((a, b) => a.getTime() - b.getTime());
  const startedAt = timestamps[0]?.toISOString() ?? (/* @__PURE__ */ new Date()).toISOString();
  const endedAt = timestamps[timestamps.length - 1]?.toISOString() ?? startedAt;
  const duration = timestamps.length >= 2 ? Math.round((timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / 1e3) : 0;
  return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, turnCount, models, duration, startedAt, endedAt };
}

// src/api-client.ts
async function reportUsage(config, payload) {
  const endpoint = getEndpoint(config);
  const res = await fetch(`${endpoint}/usage/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(payload)
  });
  return { ok: res.ok, status: res.status };
}

// src/flush-entry.ts
async function flush() {
  const config = readConfig();
  if (!config) {
    process.exit(0);
  }
  const dataDir2 = process.env.CLAUDE_PLUGIN_DATA ?? join2(process.env.HOME ?? "", ".burnboard");
  const pendingDir = join2(dataDir2, "pending");
  const lockPath = join2(dataDir2, "flush.lock");

  // Prevent concurrent flush processes
  if (existsSync(lockPath)) {
    try {
      const lockAge = Date.now() - statSync(lockPath).mtimeMs;
      if (lockAge < 60_000) return; // Active lock (<60s): another flush is running
      // Stale lock (>=60s): previous process likely crashed, proceed
    } catch {
      // stat failed, proceed anyway
    }
  }

  // Acquire lock
  try {
    writeFileSync(lockPath, String(process.pid));
  } catch {
    return;
  }

  try {
    let files;
    try {
      files = readdirSync(pendingDir);
    } catch {
      return;
    }
    if (files.length === 0) return;
    const sevenDaysAgo = Date.now() - 7 * 864e5;
    const validFiles = [];
    for (const file of files) {
      const filePath = join2(pendingDir, file);
      const stat = statSync(filePath);
      if (stat.mtimeMs < sevenDaysAgo) {
        unlinkSync(filePath);
      } else {
        validFiles.push(file);
      }
      // Update monthly summary for statusline HUD
      const summaryPath = join2(dataDir2, "monthly-summary.json");
      let summary = { month: "", totalTokens: 0, sessionsReported: 0, lastUpdated: "" };
      try { summary = JSON.parse(readFileSync3(summaryPath, "utf-8")); } catch {}
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (summary.month !== currentMonth) {
        summary = { month: currentMonth, totalTokens: 0, sessionsReported: 0, lastUpdated: "" };
      }
      for (const s of sessions) {
        summary.totalTokens += s.summary.totalTokens;
        summary.sessionsReported += 1;
      }
      summary.lastUpdated = new Date().toISOString();
      try { writeFileSync(join2(dataDir2, "monthly-summary.json"), JSON.stringify(summary)); } catch {}
    }
    if (validFiles.length === 0) return;
    const sessions = [];
    for (const file of validFiles.slice(0, 10)) {
      const filePath = join2(pendingDir, file);
      const transcriptPath = readFileSync3(filePath, "utf-8").trim();
      try {
        const summary = parseTranscript(transcriptPath);
        sessions.push({ sessionId: file, summary, file });
      } catch {
      }
    }
    if (sessions.length === 0) return;
    const payload = {
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        summary: {
          inputTokens: s.summary.inputTokens,
          outputTokens: s.summary.outputTokens,
          totalTokens: s.summary.totalTokens,
          models: s.summary.models,
          turnCount: s.summary.turnCount,
          duration: s.summary.duration
        },
        startedAt: s.summary.startedAt,
        endedAt: s.summary.endedAt
      }))
    };
    try {
      const result = await reportUsage(config, payload);
      if (result.ok) {
        for (const s of sessions) {
          try {
            unlinkSync(join2(pendingDir, s.file));
          } catch {
          }
        }
      }
    } catch {
    }
  } finally {
    // Always release lock
    try { unlinkSync(lockPath); } catch {}
  }
}
flush();
