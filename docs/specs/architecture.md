# Architecture

## 技術構成

- Frontend: React + TypeScript + Vite
- Domain Logic: `src/domain`
- Storage Wrapper: `src/storage`
- API: URLごとのメモを扱う薄いCRUD API
- DB: memo_id をキーにした永続ストレージ
- Auth: なし

## ディレクトリ責務

```text
src/
  App.tsx
    画面表示とイベント処理。domain/storageを組み合わせる。

  domain/
    メモ、項目、完了状態、URL生成などの業務ロジック。

  storage/
    API呼び出しまたは将来の保存方式への薄いラッパー。
```

## データ境界

- Frontend
  - 入力、表示、フォーカス、編集イベントを担当する。
  - URLのパスから memo_id を取り出す。
- Domain
  - メモ本文、買い物項目、完了状態、表示条件を決める。
  - 完了した項目は active list から外す。
- Storage
  - メモの読み込みと保存のみを担当する。
  - 保存ボタンの有無やDebounceの有無は持たない。
- API/DB
  - 共有URLごとのメモを保存する。
  - URLを知っていることをアクセス条件とする。

## 依存方向

- `App.tsx` → `domain` / `storage`
- `domain` → 型と純粋ロジック
- `storage` → APIクライアントまたは保存ラッパー

## 設計方針

- UIと業務ロジックを分離する
- 保存処理はUIに直書きしない
- 認証は導入しない
- ランダムURLはアクセスキーとして扱う
- まずは小さく動く構造を優先する
