# Worker Result

## Task ID
task-003-debounce-autosave

## 実装内容
- メモ本文を `MemoDocument` に追加し、保存対象の業務データとして扱えるようにした。
- `App` を入力フォーム + debounce autosave に置き換え、入力変更ごとに debounce しながら入力停止後に自動保存するようにした。
- 保存状態を「読み込み中 / 自動保存中 / 保存済み / 保存失敗」で表示し、保存ボタンは置かなかった。

## 変更ファイル
- `src/App.tsx`
- `src/App.css`
- `src/domain/memo.ts`
- `src/types.ts`

## 変更理由（ファイルごと）
- `src/App.tsx`: 入力変更の debounce 保存と保存状態表示をまとめて実装するため。
- `src/App.css`: autosave 状態ラベルと本文入力の見た目を最小限調整するため。
- `src/domain/memo.ts`: 本文を持つメモ文書と更新処理を domain 側に置くため。
- `src/types.ts`: メモ本文を永続化対象の型として表現するため。

## 実行したテスト
- `npm run build`

## 結果
- ビルド成功。
- 入力停止後に自動保存される構成と、保存状態の最小表示を入れた。

## 未解決事項
- 現在の storage は in-memory 実装のままで、永続 API への接続は未対応。

## 注意点
- 手動保存ボタンは追加していない。
- debounce なしの即時保存にはしていない。
