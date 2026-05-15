# Task 002

## Feature

Feature 002: Random URL Storage

## 目的

ランダムURLをメモ識別子として扱い、URLベースの共有を成立させる。

## 依存Task

- task-001-app-shell

## 対象ファイル

- `src/App.tsx`
- `src/types.ts`
- `src/domain/*`
- `src/storage/*`

## 実装内容

- URLパスから memo_id を読み取る
- 新規メモ用のランダムID発行を扱う
- 既存メモを再表示できる前提のデータ形を作る

## 受け入れ条件

- 同じURLが同じメモを指す前提がコードに表現される
- 後続Taskが保存処理を載せられる

## 実行するテスト

- `npm run build`

## 禁止事項

- ログイン画面を作らない
- 権限管理を作らない
- 外部サービスへの依存を増やさない
