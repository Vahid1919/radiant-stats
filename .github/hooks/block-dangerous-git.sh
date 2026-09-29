#!/usr/bin/env bash

set -euo pipefail

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

if [[ -z "$command" ]]; then
  exit 0
fi

deny() {
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"This workspace blocks dangerous Git commands."}}
JSON
  exit 0
}

if printf '%s' "$command" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+(-[^[:space:]]+|--[^[:space:]]+))*[[:space:]]+push([[:space:];&|]|$)'; then
  deny
fi

if printf '%s' "$command" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+(-[^[:space:]]+|--[^[:space:]]+))*[[:space:]]+commit([[:space:];&|]|$)'; then
  deny
fi

if printf '%s' "$command" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+(-[^[:space:]]+|--[^[:space:]]+))*[[:space:]]+reset[[:space:]]+--hard([[:space:];&|]|$)'; then
  deny
fi

if printf '%s' "$command" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+(-[^[:space:]]+|--[^[:space:]]+))*[[:space:]]+clean([^;&|]*)(-f|--force)'; then
  deny
fi

if printf '%s' "$command" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+(-[^[:space:]]+|--[^[:space:]]+))*[[:space:]]+branch[[:space:]]+-D([[:space:];&|]|$)'; then
  deny
fi

if printf '%s' "$command" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+(-[^[:space:]]+|--[^[:space:]]+))*[[:space:]]+(checkout|restore)[[:space:]]+\.([[:space:];&|]|$)'; then
  deny
fi