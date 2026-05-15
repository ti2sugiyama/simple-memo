# simple-memo

URLを知っている人だけが共有できる、シンプルなWebメモ帳のための開発テンプレートです。

## 目的

- 家族の買い物メモを素早く共有する
- ページを開いた瞬間に入力へフォーカスする
- 保存ボタンを置かず、入力停止後に自動保存する
- ログイン画面を作らず、ランダムURLを実質的なアクセスキーにする
- チェックした買い物項目は一覧から消す

## 開発フロー

```text
Human
  ↓
Manager
  ↓
Planner / Architect
  ↓
Task Queue
  ↓
Manager → Worker → Reviewer → Manager
  ↓
Tester
  ↓
Documenter
  ↓
Manager
```

## 含まれるもの

```text
prompts/
  manager.md
  planner.md
  architect.md
  worker.md
  reviewer.md
  tester.md
  documenter.md

scripts/
  run-feature-cycle.sh
  run-one-task.sh
  run-planning.sh
  run-feature-finish.sh
  clear-stop.sh

docs/
  specs/
  features/
  tasks/
  management/
  results/

src/
  React + TypeScript + Vite の最小MVP雛形
```

## 初回セットアップ

```bash
npm install
npm run dev
```

## Codex CLIで試す

```bash
codex --help
```

### 1. Featureの計画だけ作る

```bash
./scripts/run-planning.sh "シンプルな共有メモを作りたい"
```

### 2. Taskを1つだけ実装する

```bash
./scripts/run-one-task.sh
```

### 3. Feature単位で自動ループする

```bash
./scripts/run-feature-cycle.sh
```

`STOP_REQUIRED.md` が作成されたら人間確認が必要です。

```bash
cat docs/management/STOP_REQUIRED.md
```

解除する場合:

```bash
./scripts/clear-stop.sh
```
