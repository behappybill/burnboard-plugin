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

6. **Final message** — show exactly this:
   ```
   Setup complete! Your token usage will be tracked after each Claude Code session.

   View your stats: https://burnboard.io/dashboard

   ⭐ If you find BurnBoard useful, please star the repo to support the project:
   https://github.com/behappybill/burnboard-plugin
   ```
