#!/bin/sh
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
TRANSCRIPT=$(echo "$INPUT" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
PENDING_DIR="${CLAUDE_PLUGIN_DATA}/pending"
mkdir -p "$PENDING_DIR"
[ -n "$SESSION_ID" ] && [ -n "$TRANSCRIPT" ] && \
  echo "$TRANSCRIPT" > "$PENDING_DIR/$SESSION_ID"
# Flush pending sessions in the background (fire-and-forget)
node "${CLAUDE_PLUGIN_ROOT}/scripts/flush.mjs" >/dev/null 2>&1 &
exit 0
