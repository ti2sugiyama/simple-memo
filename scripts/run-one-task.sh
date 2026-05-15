#!/usr/bin/env bash
set -euo pipefail

mkdir -p docs/management docs/results

if ! command -v codex >/dev/null 2>&1; then
  echo "codex command not found. Install or expose Codex CLI before running this script." >&2
  exit 127
fi

EXTRA_INSTRUCTION="${EXTRA_INSTRUCTION:-}"
TASK_STATUS_FILE="docs/management/task-status.md"
CURRENT_TASK_FILE="docs/management/current-task.md"
RESULTS_DIR="docs/results"

while [ $# -gt 0 ]; do
  case "$1" in
    --instruction)
      if [ $# -lt 2 ]; then
        echo "--instruction requires a value" >&2
        exit 2
      fi
      EXTRA_INSTRUCTION="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 [--instruction \"text\"]" >&2
      exit 2
      ;;
  esac
done

trim() {
  local value="${1:-}"
  value="${value#${value%%[![:space:]]*}}"
  value="${value%${value##*[![:space:]]}}"
  printf '%s' "$value"
}

extract_section() {
  local file="$1"
  local heading="$2"
  awk -v heading="$heading" '
    $0 == heading { capture = 1; next }
    capture && /^## / { exit }
    capture { print }
  ' "$file"
}

task_row() {
  local task_id="$1"
  awk -F'|' -v task_id="$task_id" '
    function trim(s) {
      gsub(/^[ \t`]+|[ \t`]+$/, "", s)
      return s
    }
    /^\|/ && trim($2) == task_id {
      printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\n", trim($2), trim($3), trim($4), trim($5), trim($6), trim($7), trim($8)
      exit
    }
  ' "$TASK_STATUS_FILE"
}

current_task_id() {
  awk '
    $0 ~ /^## Task ID$/ { getline; getline; print; exit }
  ' "$CURRENT_TASK_FILE" 2>/dev/null | tr -d '\r'
}

select_next_task_id() {
  awk -F'|' '
    function trim(s) {
      gsub(/^[ \t`]+|[ \t`]+$/, "", s)
      return s
    }
    /^\|/ {
      task = trim($2)
      state = trim($4)
      if (task == "Task" || task == "---" || task == "") {
        next
      }
      if (state == "needs_rework" && needs_rework == "") {
        needs_rework = task
      }
      if (state == "ready" && ready == "") {
        ready = task
      }
    }
    END {
      if (needs_rework != "") {
        print needs_rework
      } else if (ready != "") {
        print ready
      }
    }
  ' "$TASK_STATUS_FILE" | tr -d '\r'
}

render_current_task() {
  local task_id="$1"
  local row
  row="$(task_row "$task_id")"
  if [ -z "$row" ]; then
    echo "Cannot render current task for unknown task id: $task_id" >&2
    exit 1
  fi

  IFS=$'\t' read -r row_task feature state retry dependency blocker notes <<< "$row"
  local task_doc="docs/tasks/${task_id}.md"
  local feature_doc="docs/features/${feature}.md"

  if [ ! -f "$task_doc" ]; then
    echo "Missing task doc: $task_doc" >&2
    exit 1
  fi

  if [ ! -f "$feature_doc" ]; then
    echo "Missing feature doc: $feature_doc" >&2
    exit 1
  fi

  {
    echo "# Current Task"
    echo
    echo "## Task ID"
    echo
    echo "$task_id"
    echo
    echo "## Feature"
    echo
    printf '%s\n' "$(extract_section "$task_doc" '## Feature')"
    echo
    echo "## 目的"
    echo
    printf '%s\n' "$(extract_section "$task_doc" '## 目的')"
    echo
    echo "## 必読資料"
    echo
    echo "- \`AGENTS.md\`"
    echo "- \`docs/specs/product-brief.md\`"
    echo "- \`docs/specs/architecture.md\`"
    echo "- \`docs/features/${feature}.md\`"
    echo "- \`docs/tasks/${task_id}.md\`"
    echo
    echo "## 対象スコープ"
    echo
    printf '%s\n' "$(extract_section "$task_doc" '## 対象ファイル')"
    echo
    echo "## 実装内容"
    echo
    printf '%s\n' "$(extract_section "$task_doc" '## 実装内容')"
    echo
    echo "## 受け入れ条件"
    echo
    printf '%s\n' "$(extract_section "$task_doc" '## 受け入れ条件')"
    echo
    echo "## 実行するテスト"
    echo
    printf '%s\n' "$(extract_section "$task_doc" '## 実行するテスト')"
    echo
    echo "## 禁止事項"
    echo
    printf '%s\n' "$(extract_section "$task_doc" '## 禁止事項')"
    echo
    echo "## 完了後の記録先"
    echo
    echo "- \`${RESULTS_DIR}/${task_id}-worker-result.md\`"
  } > "$CURRENT_TASK_FILE"
}

update_task_state() {
  local task_id="$1"
  local new_state="$2"
  local tmp
  tmp="$(mktemp)"
  awk -F'|' -v task_id="$task_id" -v new_state="$new_state" '
    function trim(s) {
      gsub(/^[ \t`]+|[ \t`]+$/, "", s)
      return s
    }
    /^\|/ && trim($2) == task_id {
      printf "| %s | %s | %s | %s | %s | %s | %s |\n", trim($2), trim($3), new_state, trim($5), trim($6), trim($7), trim($8)
      next
    }
    { print }
  ' "$TASK_STATUS_FILE" > "$tmp"
  mv "$tmp" "$TASK_STATUS_FILE"
}

unblock_dependent_tasks() {
  local completed_task_id="$1"
  local tmp
  tmp="$(mktemp)"
  awk -F'|' -v completed_task_id="$completed_task_id" '
    function trim(s) {
      gsub(/^[ \t`]+|[ \t`]+$/, "", s)
      return s
    }
    /^\|/ {
      state = trim($4)
      dependency = trim($6)
      if (state == "blocked" && dependency == completed_task_id) {
        printf "| %s | %s | %s | %s | %s | %s | %s |\n", trim($2), trim($3), "ready", trim($5), trim($6), trim($7), trim($8)
        next
      }
    }
    { print }
  ' "$TASK_STATUS_FILE" > "$tmp"
  mv "$tmp" "$TASK_STATUS_FILE"
}

review_decision() {
  awk '
    $0 ~ /^## 判定$/ { capture = 1; next }
    capture && NF {
      gsub(/^[[:space:]]*-[[:space:]]*/, "", $0)
      print
      exit
    }
  ' docs/management/review.md | tr -d '\r'
}

selected_task_id="$(current_task_id)"
if [ -n "$selected_task_id" ]; then
  selected_row="$(task_row "$selected_task_id")"
  selected_state=""
  if [ -n "$selected_row" ]; then
    IFS=$'\t' read -r _ _ selected_state _ _ _ _ <<< "$selected_row"
  fi
  case "$selected_state" in
    ready|needs_rework)
      ;;
    *)
      selected_task_id=""
      ;;
  esac
fi

if [ -z "$selected_task_id" ]; then
  selected_task_id="$(select_next_task_id)"
fi

if [ -z "$selected_task_id" ]; then
  echo "No ready task found in $TASK_STATUS_FILE" >&2
  exit 0
fi

echo "Selected task: $selected_task_id"
render_current_task "$selected_task_id"

WORKER_EXTRA_BLOCK=""
if [ -n "$EXTRA_INSTRUCTION" ]; then
  WORKER_EXTRA_BLOCK="

# 追加指示（Human）

$EXTRA_INSTRUCTION
"
fi

if [ -f docs/management/STOP_REQUIRED.md ]; then
  echo "STOP_REQUIRED.md exists. Please resolve it first."
  cat docs/management/STOP_REQUIRED.md
  exit 0
fi

echo "=== Worker: implement current task ==="
codex exec --skip-git-repo-check "$(cat prompts/worker.md)${WORKER_EXTRA_BLOCK}"

if [ -f docs/management/STOP_REQUIRED.md ]; then
  echo "Worker requested human confirmation."
  cat docs/management/STOP_REQUIRED.md
  exit 0
fi

echo "=== Reviewer: review diff ==="
codex exec --skip-git-repo-check "$(cat prompts/reviewer.md)"

if [ -f docs/management/STOP_REQUIRED.md ]; then
  echo "Reviewer requested human confirmation."
  cat docs/management/STOP_REQUIRED.md
  exit 0
fi

decision="$(review_decision)"
case "$decision" in
  OK)
    update_task_state "$selected_task_id" "done"
    unblock_dependent_tasks "$selected_task_id"
    ;;
  NEEDS_REWORK)
    update_task_state "$selected_task_id" "needs_rework"
    ;;
  STOP_REQUIRED)
    echo "Reviewer requested human confirmation."
    cat docs/management/STOP_REQUIRED.md
    exit 0
    ;;
  *)
    echo "Unknown review decision: $decision" >&2
    exit 1
    ;;
esac

next_task_id="$(select_next_task_id)"
if [ -n "$next_task_id" ]; then
  echo "Next task: $next_task_id"
  render_current_task "$next_task_id"
fi

echo "One task cycle done."
