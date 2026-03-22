# BurnBoard Plugin for Claude Code

Track your Claude Code token usage and compete on the global leaderboard.

## Features

- Automatic token usage tracking via Claude Code hooks
- Personal dashboard with usage charts and stats
- Global ranking leaderboard
- 6-tier gamification system (Spark → Supernova)

## Install

```bash
claude plugin add https://github.com/behappybill/burnboard-plugin
```

## Setup

After installing, run the setup command in Claude Code:

```
/burnboard:setup
```

You'll need an **API Key** — create one at https://burnboard-web.vercel.app/settings

## How It Works

The plugin registers two Claude Code hooks:

- **Stop hook** (`mark.sh`) — Records the session ID and transcript path after each Claude response
- **SessionEnd hook** (`flush.mjs`) — Parses the transcript, extracts token usage, and reports to the BurnBoard API

All data is stored locally in `${CLAUDE_PLUGIN_DATA}` until successfully reported.

## Local Development

Test the plugin locally without installing from a marketplace:

```bash
claude --plugin-dir ./
```

## License

MIT
