# BurnBoard Plugin for Claude Code

> Track your Claude Code token usage and compete on the global leaderboard.

**[burnboard-web.vercel.app](https://burnboard-web.vercel.app)**

<!-- TODO: 데모 GIF로 교체 — 설치 → setup → 대시보드 확인 흐름 -->
<!-- ![BurnBoard Demo](docs/demo.gif) -->

## Quick Start

### 1. Install

```bash
claude plugin add https://github.com/behappybill/burnboard-plugin
```

### 2. Setup

Run in Claude Code:

```
/burnboard:setup
```

You'll need an API key — create one at [burnboard-web.vercel.app/settings](https://burnboard-web.vercel.app/settings) (GitHub login required).

That's it. Your token usage is now tracked automatically.

## Features

- **Automatic Tracking** — Zero-config after setup. Every Claude Code session is recorded
- **Zero Overhead** — Stop hook is a pure shell script (~1ms). No impact on Claude Code response speed
- **Offline Resilient** — Failed reports are queued locally and retried on next session
- **Batch Reporting** — Multiple pending sessions are sent in a single API call

## How It Works

```
Claude Code Session
       │
       ├─ [Stop event] ──→ mark.sh
       │                    Saves session_id + transcript path
       │                    Pure shell, ~1ms, no Node.js spawn
       │
       └─ [SessionEnd] ──→ flush.mjs
                            Parses transcript JSONL
                            Extracts token usage per model
                            Reports to BurnBoard API
                            Cleans up on success
```

The plugin registers two Claude Code hooks:

| Hook | Script | What it does |
|------|--------|-------------|
| `Stop` | `mark.sh` | Records session ID and transcript path (~1ms, pure shell) |
| `SessionEnd` | `flush.mjs` | Parses transcript, extracts tokens, reports to API |

All pending data is stored in `${CLAUDE_PLUGIN_DATA}` until successfully reported.

## Tier System

Climb the ranks each month:

**Spark** (0) → **Ember** (1M) → **Flame** (5M) → **Blaze** (20M) → **Inferno** (50M) → **Supernova** (100M+)

## Privacy

- Only aggregated token counts are sent (input/output tokens, model, turn count, duration)
- No conversation content is transmitted
- You can opt out of the public leaderboard in settings

## Local Development

```bash
claude --plugin-dir ./
```

## Related

- **[burnboard](https://github.com/behappybill/burnboard)** — Web app (dashboard, leaderboard, API)

## License

MIT
