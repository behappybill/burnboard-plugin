---
name: setup
description: Configure BurnBoard plugin with your API key
---

# BurnBoard Setup

Help the user configure BurnBoard. The entire setup is just one step: paste the API key.

## Steps

1. Ask the user for their **API Key**.
   - Tell them: "Paste your BurnBoard API key (starts with `bb_`). You can create one at https://burnboard.io/settings"
   - Validate the key starts with `bb_` and is 35 characters long.
   - If invalid, tell them the format and ask again.

2. Write the configuration to `${CLAUDE_PLUGIN_DATA}/config.json`:
   ```json
   {
     "apiKey": "<their API key>"
   }
   ```

3. Create the `${CLAUDE_PLUGIN_DATA}/pending/` directory if it does not exist.

4. **Add hook permissions**: Read the user's `~/.claude/settings.local.json` file. Add `"Bash(node:*)"` and `"Bash(/bin/sh:*)"` to `permissions.allow` array if they don't already exist. If the file doesn't exist, create it with:
   ```json
   {
     "permissions": {
       "allow": [
         "Bash(node:*)",
         "Bash(/bin/sh:*)"
       ]
     }
   }
   ```

5. **Connection test**: Run the following command to verify the key works:
   ```bash
   curl -s -H "Authorization: Bearer <their API key>" https://burnboard.io/api/ping
   ```
   - If response contains `"ok": true`, show: "Connected as **{user}**! BurnBoard will now track your token usage automatically."
   - If it fails, show: "Could not connect. Please check your API key and try again."

6. **[선택] 계정 수준 사용량 추적 (Anthropic API 키)**:
   - 다음 내용을 안내한다:
     "BurnBoard는 기본적으로 터미널 세션의 트랜스크립트만 집계합니다. Anthropic API 키를 등록하면 터미널·웹·데스크탑 앱 등 **모든 인터페이스**의 사용량을 계정 단위로 통합 집계할 수 있습니다. API 키는 로컬 `config.json`에만 저장되며, Anthropic 사용량 엔드포인트 조회 전용으로만 사용됩니다."
   - Ask the user using AskUserQuestion:
     - question: "Would you like to enable account-level tracking with your Anthropic API key?"
     - options: ["Yes, set it up!", "No thanks, terminal only is fine"]
   - If the user picks "Yes, set it up!":
     1. Ask: "Paste your Anthropic API key (starts with `sk-ant-`). You can create one at https://console.anthropic.com/settings/keys — it only needs **usage:read** (or read-only) permissions."
     2. Validate the key starts with `sk-ant-`.
     3. Test the key by running:
        ```bash
        START=$(date -u +%Y-%m-01); TODAY=$(date -u +%Y-%m-%d); curl -sf -H "x-api-key: <their key>" -H "anthropic-version: 2023-06-01" "https://api.anthropic.com/v1/usage?start_date=${START}&end_date=${TODAY}"
        ```
        - If it returns JSON (HTTP 200), the key works.
        - If it returns an error, show: "Could not validate the API key. Please check the key and try again." and re-prompt.
     4. Add `"anthropicApiKey": "<their key>"` to `${CLAUDE_PLUGIN_DATA}/config.json` alongside the existing `apiKey`.
     5. Show: "Account-level tracking enabled! Usage from all interfaces will be synced automatically (up to every 30 minutes)."
   - If the user picks "No thanks": Move on without comment.

7. **GitHub Star 요청**:
   - Ask the user to pick one of the following options using AskUserQuestion:
     - question: "⭐ Would you like to star the BurnBoard plugin repo on GitHub to support the project?"
     - options: ["Yes, star it!", "Maybe later", "No thanks"]
   - If the user picks "Yes, star it!":
     1. Run: `gh api user/starred/behappybill/burnboard-plugin -X PUT 2>&1`
     2. If exit code is 0 (success): Show "Thanks for the star! ⭐"
     3. If it fails (gh not installed or not authenticated): Show "No worries! You can star it manually: https://github.com/behappybill/burnboard-plugin"
   - If the user picks "Maybe later" or "No thanks": Move on without comment.


8. **Final message** — show exactly this:
   ```
   Setup complete! Your token usage will be tracked after each Claude Code session.

   View your stats: https://burnboard.io/dashboard
   ```
