#!/usr/bin/env bash
# send-email.sh — Render briefing markdown to styled HTML and send via Resend
# Usage: ./send-email.sh <briefing.md> [--dry-run]
#
# --dry-run: render and save HTML but don't send email
#
# Configuration: set these environment variables (or put them in .env):
#   RESEND_API_KEY  — your Resend API key
#   BRIEFING_FROM   — sender address (default: briefing@mail.example.com)
#   BRIEFING_TO     — recipient address (default: reader@example.com)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${BRIEFING_ENV_FILE:-$SCRIPT_DIR/.env}"
FROM_EMAIL="${BRIEFING_FROM:-briefing@mail.example.com}"
TO_EMAIL="${BRIEFING_TO:-reader@example.com}"

MD_FILE=""
DRY_RUN=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    *) MD_FILE="$1"; shift ;;
  esac
done

if [[ -z "$MD_FILE" || ! -f "$MD_FILE" ]]; then
  echo "Usage: $0 <briefing.md> [--dry-run]" >&2
  exit 1
fi

# Load env if available
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE"

# Render markdown to HTML
HTML=$(node "$SCRIPT_DIR/render-email.js" "$MD_FILE")

# Extract subject from first heading
SUBJECT=$(head -1 "$MD_FILE" | sed 's/^# //' | sed 's/ ·.*//' | xargs)

# Save rendered HTML alongside the markdown
HTML_FILE="${MD_FILE%.md}.html"
echo "$HTML" > "$HTML_FILE"
echo "Rendered: $HTML_FILE" >&2

if [[ "$DRY_RUN" == true ]]; then
  echo "Dry run — not sending." >&2
  exit 0
fi

# Send via Resend
JSON_HTML=$(echo "$HTML" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")

RESPONSE=$(curl -s -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"from\":\"$FROM_EMAIL\",\"to\":\"$TO_EMAIL\",\"subject\":\"☀️ $SUBJECT\",\"html\":$JSON_HTML}")

echo "Resend: $RESPONSE" >&2
