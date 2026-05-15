import {
  createMemoDocument,
  createMemoPath,
  resolveMemoIdFromPathname,
} from './domain/memo';
import type { MemoItem } from './types';

const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;
const memoId = resolveMemoIdFromPathname(pathname);

const sampleMemo = createMemoDocument(
  memoId,
  '家族の買い物メモ',
  [
    { id: '1', text: '牛乳', checked: false },
    { id: '2', text: '卵', checked: true },
    { id: '3', text: 'パン', checked: false },
  ],
);

const visibleItems = sampleMemo.items.filter((item) => !item.checked);

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">simple-memo framework</p>
        <h1>共有URLで使う、軽い買い物メモ。</h1>
        <p className="lede">
          このリポジトリには、Manager / Worker / Reviewer で回すための
          小さな開発フレームワークと、メモ帳仕様の初期ドキュメントを置いています。
        </p>
      </section>

      <section className="memo-card" aria-label="memo preview">
        <div className="memo-header">
          <div>
            <p className="memo-label">Memo</p>
            <strong>{sampleMemo.title}</strong>
            <div className="memo-path">{createMemoPath(sampleMemo.memoId)}</div>
          </div>
          <span className="status-pill">framework ready</span>
        </div>

        <div className="memo-editor">
          <label htmlFor="memo-input">メモ本文</label>
          <textarea
            id="memo-input"
            autoFocus
            placeholder="ページを開いた瞬間に入力できるようにする予定です。"
          />
        </div>

        <div className="memo-list">
          <p className="memo-label">表示中の項目</p>
          <ul>
            {visibleItems.map((item: MemoItem) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
