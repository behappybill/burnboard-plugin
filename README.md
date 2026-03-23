# BurnBoard Plugin for Claude Code

> Track your Claude Code token usage and compete on the global leaderboard.

**[burnboard.io](https://burnboard.io)**

<!-- TODO: 데모 GIF로 교체 — 설치 → setup → 대시보드 확인 흐름 -->
<!-- ![BurnBoard Demo](docs/demo.gif) -->

## Quick Start

Claude Code 내에서 아래 3단계를 순서대로 실행하세요.

### 1. 마켓플레이스 등록

BurnBoard 플러그인 저장소를 마켓플레이스로 등록합니다.

```bash
claude marketplace add https://github.com/behappybill/burnboard-plugin
```

### 2. 플러그인 설치

등록된 마켓플레이스에서 BurnBoard 플러그인을 설치합니다.

```bash
claude plugin install burnboard
```

설치 과정에서 hook 권한 승인을 요청할 수 있습니다. 허용해 주세요.

### 3. Setup

Claude Code를 실행한 뒤, 아래 슬래시 커맨드를 입력합니다.

```
/burnboard:setup
```

API 키를 입력하라는 안내가 나타납니다. [burnboard.io/settings](https://burnboard.io/settings)에서 GitHub 로그인 후 API 키를 발급받아 입력하세요.

설정이 완료되면 토큰 사용량이 자동으로 추적됩니다.

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
