#!/bin/sh
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
TRANSCRIPT=$(echo "$INPUT" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
PENDING_DIR="${CLAUDE_PLUGIN_DATA}/pending"
mkdir -p "$PENDING_DIR"
[ -n "$SESSION_ID" ] && [ -n "$TRANSCRIPT" ] && \
  echo "$TRANSCRIPT" > "$PENDING_DIR/$SESSION_ID"
# Flush pending sessions in the background (fire-and-forget).
# Detach from mark.sh's process group so Claude Code's hook-runner
# teardown/timeout signals do not kill the flush mid-POST.
if command -v setsid >/dev/null 2>&1; then
  setsid node "${CLAUDE_PLUGIN_ROOT}/scripts/flush.mjs" >/dev/null 2>&1 </dev/null &
else
  # macOS has no setsid by default. Double-fork: the outer & returns immediately,
  # the inner & inside the subshell is reparented to launchd (PPID 1), escaping
  # this shell's process group.
  ( node "${CLAUDE_PLUGIN_ROOT}/scripts/flush.mjs" >/dev/null 2>&1 </dev/null & ) &
fi
exit 0
