# BurnBoard Plugin for Claude Code

> Claude Code 토큰 사용량을 추적하고 글로벌 리더보드에서 경쟁하세요.

**[burnboard.io](https://burnboard.io)**

[English](README.md) | [日本語](README.ja.md)

## 빠른 시작

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

### 3. 설정

Claude Code를 실행한 뒤, 아래 슬래시 커맨드를 입력합니다.

```
/burnboard:setup
```

API 키를 입력하라는 안내가 나타납니다. [burnboard.io/settings](https://burnboard.io/settings)에서 GitHub 로그인 후 API 키를 발급받아 입력하세요.

설정이 완료되면 토큰 사용량이 자동으로 추적됩니다.

## 기능

- **자동 추적** — 설정 후 별도 조작 없이 모든 Claude Code 세션이 기록됩니다
- **상태바 HUD** — 터미널 상태바에 실시간 토큰 사용량, 티어, 진행률이 표시됩니다
- **무부하 동작** — Stop hook은 순수 셸 스크립트로 약 1ms 만에 실행됩니다. Claude Code 응답 속도에 영향을 주지 않습니다
- **오프라인 복원력** — 전송에 실패한 보고는 로컬에 저장되어 다음 세션에 재시도됩니다
- **배치 전송** — 여러 대기 세션을 단일 API 호출로 전송합니다

## 상태바 HUD

설정 완료 후 터미널 상태바에서 실시간 토큰 사용량을 확인할 수 있습니다.

```
🔶 Ember  1.8M/5.0M ██░░░░░░░░ 19%  │  Session: 84.2K
```

- **티어 아이콘 & 이름** — 현재 티어에 맞는 색상으로 표시됩니다
- **월간 토큰 / 다음 티어 임계값** — 진행 상황을 확인합니다
- **진행 막대** — 다음 티어까지의 시각적 표시
- **세션 토큰** — 현재 세션의 사용량

상태바는 Claude Code의 Statusline API를 통해 5초 캐시로 자동 업데이트됩니다.

## 동작 방식

```
Claude Code 세션
       │
       ├─ [Stop 이벤트] ──→ mark.sh
       │                     세션 ID와 트랜스크립트 경로 저장
       │                     순수 셸, ~1ms, Node.js 실행 없음
       │
       └─ [SessionEnd] ──→ flush.mjs
                             트랜스크립트 JSONL 파싱
                             모델별 토큰 사용량 추출
                             BurnBoard API로 보고
                             성공 시 정리
```

플러그인은 두 가지 Claude Code hook을 등록합니다.

| Hook | 스크립트 | 역할 |
|------|----------|------|
| `Stop` | `mark.sh` | 세션 ID와 트랜스크립트 경로 기록 (~1ms, 순수 셸) |
| `SessionEnd` | `flush.mjs` | 트랜스크립트 파싱, 토큰 추출, API 보고 |

모든 대기 데이터는 성공적으로 전송될 때까지 `${CLAUDE_PLUGIN_DATA}`에 저장됩니다.

## 티어 시스템

매월 순위를 올려보세요.

**Spark** (0) → **Ember** (100만) → **Flame** (500만) → **Blaze** (2000만) → **Inferno** (5000만) → **Supernova** (1억+)

## 개인정보 보호

- 집계된 토큰 수만 전송됩니다 (입력/출력 토큰, 모델, 턴 수, 소요 시간)
- 대화 내용은 전송되지 않습니다
- 설정에서 공개 리더보드 참여를 거부할 수 있습니다

## 로컬 개발

```bash
claude --plugin-dir ./
```

## 관련 프로젝트

- **[burnboard](https://github.com/behappybill/burnboard)** — 웹 앱 (대시보드, 리더보드, API)

## 라이선스

MIT
