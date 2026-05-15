#!/usr/bin/env bash
set -euo pipefail

REQUEST="${*:-}"

if [ -z "$REQUEST" ]; then
  echo "Usage: ./scripts/run-planning.sh \"作りたいFeature\""
  exit 1
fi

mkdir -p docs/tasks docs/features docs/management docs/results

if ! command -v codex >/dev/null 2>&1; then
  echo "codex command not found. Install or expose Codex CLI before running this script." >&2
  exit 127
fi

echo "=== Planner ==="
codex exec --skip-git-repo-check "$(cat prompts/planner.md)

# 人間からのFeature要求

$REQUEST
"

echo "=== Architect ==="
codex exec --skip-git-repo-check "$(cat prompts/architect.md)

# 確認対象Feature要求

$REQUEST
"

echo "Planning done."
