# BurnBoard Plugin for Claude Code

🇰🇷 [한국어](ko.md) &nbsp;|&nbsp; 🇯🇵 [日本語](jp.md)

> Track your Claude Code token usage and compete on the global leaderboard.

**[burnboard.io](https://burnboard.io)**

<!-- TODO: Replace with demo GIF — install → setup → dashboard flow -->
<!-- ![BurnBoard Demo](docs/demo.gif) -->

## Quick Start

Follow these 3 steps inside Claude Code.

### 1. Register Marketplace

Register the BurnBoard plugin repository as a marketplace source.

```bash
claude marketplace add https://github.com/behappybill/burnboard-plugin
```

### 2. Install Plugin

Install the BurnBoard plugin from the registered marketplace.

```bash
claude plugin install burnboard
```

You may be prompted to approve hook permissions during installation. Please allow it.

### 3. Setup

Run Claude Code, then enter the following slash command.

```
/burnboard:setup
```

You will be prompted to enter your API key. Get one from [burnboard.io/settings](https://burnboard.io/settings) after signing in with GitHub.

Once setup is complete, token usage will be tracked automatically.

## Features

- **Automatic Tracking** — Zero-config after setup. Every Claude Code session is recorded
- **Statusline HUD** — Real-time token usage, tier, and progress displayed in the terminal status bar
- **Zero Overhead** — Stop hook is a pure shell script (~1ms). No impact on Claude Code response speed
- **Offline Resilient** — Failed reports are queued locally and retried on next session
- **Batch Reporting** — Multiple pending sessions are sent in a single API call

## Statusline HUD

After setup, your terminal status bar shows real-time token usage:

```
🔶 Ember  1.8M/5.0M ██░░░░░░░░ 19%  │  Session: 84.2K
```

- **Tier icon & name** — Color-coded to your current tier
- **Monthly tokens / Next tier threshold** — Track your progress
- **Progress bar** — Visual indicator to next tier
- **Session tokens** — Current session usage

The statusline updates automatically via Claude Code's Statusline API with a 5-second cache for performance.

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

---

[![BurnBoard - Turn your Claude Code usage into a competitive sport. | Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1193433&theme=dark)](https://www.producthunt.com/products/burnboard/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-burnboard)
