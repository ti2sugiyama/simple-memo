#!/usr/bin/env bash
set -euo pipefail

mkdir -p docs/management docs/results

if ! command -v codex >/dev/null 2>&1; then
  echo "codex command not found. Install or expose Codex CLI before running this script." >&2
  exit 127
fi

echo "=== Tester ==="
codex exec --skip-git-repo-check "$(cat prompts/tester.md)"

echo "=== Documenter ==="
codex exec --skip-git-repo-check "$(cat prompts/documenter.md)"

echo "=== Manager ==="
codex exec --skip-git-repo-check "$(cat prompts/manager.md)

# 追加指示

Feature完了後の状態整理をしてください。task-status.md / feature-status.md / decision-log.md を必要に応じて同期してください。
"

echo "Feature finish done."
