# Task 003

## Feature

Feature 003: Debounce Autosave

## 目的

保存ボタンなしで、入力停止後に自動保存する。

## 依存Task

- task-002-random-url-storage

## 対象ファイル

- `src/App.tsx`
- `src/domain/*`
- `src/storage/*`

## 実装内容

- 入力の変更をdebounceして保存する
- 保存中と保存失敗を最小限で扱う
- UIから保存ボタンをなくす

## 受け入れ条件

- 入力停止後に保存が走る
- 保存状態が分かる
- 手動保存ボタンがない

## 実行するテスト

- `npm run build`

## 禁止事項

- debounceなしの即時保存にしない
- 保存ボタンを復活させない
- 設計を大きく変えない
