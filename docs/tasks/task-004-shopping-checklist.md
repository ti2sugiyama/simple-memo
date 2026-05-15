# Task 004

## Feature

Feature 004: Shopping Checklist

## 目的

買い物項目を追加し、買ったらチェックして一覧から消せるようにする。

## 依存Task

- task-003-debounce-autosave

## 対象ファイル

- `src/App.tsx`
- `src/domain/*`
- `src/storage/*`

## 実装内容

- 項目追加UIを作る
- 項目をチェックできるようにする
- チェック済み項目は active list から消す

## 受け入れ条件

- 家族の買い物メモとして使える最小導線が揃う
- チェック済み項目が一覧に残らない

## 実行するテスト

- `npm run build`

## 禁止事項

- 完了項目を常時表示しない
- 複雑な操作を増やさない
- 仕様外の編集機能を増やさない
