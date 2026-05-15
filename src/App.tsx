import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  addMemoItem,
  completeMemoItem,
  createMemoDocument,
  createMemoPath,
  getActiveMemoItems,
  resolveMemoIdFromPathname,
  updateMemoContent,
} from './domain/memo';
import { createInMemoryMemoStorage } from './storage/memoStorage';
import type { MemoDocument, MemoItem } from './types';

const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;
const memoId = resolveMemoIdFromPathname(pathname);

const initialMemo = createMemoDocument(
  memoId,
  '家族の買い物メモ',
  '入力を止めると自動保存されます。',
  [
    { id: '1', text: '牛乳', checked: false },
    { id: '2', text: '卵', checked: true },
    { id: '3', text: 'パン', checked: false },
  ],
);

const memoStorage = createInMemoryMemoStorage([initialMemo]);
const SAVE_DEBOUNCE_MS = 500;

type SaveState = 'loading' | 'saving' | 'saved' | 'error';

const formatSavedAt = (updatedAt?: string): string => {
  if (!updatedAt) {
    return 'まだ保存されていません';
  }

  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(updatedAt));
};

const getMemoContentKey = (body: string, items: MemoItem[]): string =>
  JSON.stringify({
    body,
    items: items.map((item) => ({
      id: item.id,
      text: item.text,
      checked: item.checked,
    })),
  });

const getStatusLabel = (state: SaveState): string => {
  switch (state) {
    case 'loading':
      return '読み込み中';
    case 'saving':
      return '自動保存中';
    case 'saved':
      return '保存済み';
    case 'error':
      return '保存失敗';
  }
};

export default function App() {
  const [memo, setMemo] = useState<MemoDocument | null>(null);
  const [draftBody, setDraftBody] = useState('');
  const [draftItems, setDraftItems] = useState<MemoItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const [isLoaded, setIsLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const newItemInputRef = useRef<HTMLInputElement | null>(null);
  const hasFocusedRef = useRef(false);
  const saveRequestIdRef = useRef(0);

  const draftMemo = memo
    ? {
        ...memo,
        body: draftBody,
        items: draftItems,
      }
    : null;

  useEffect(() => {
    let isActive = true;

    setSaveState('loading');
    setIsLoaded(false);

    void memoStorage
      .load(memoId)
      .then((loadedMemo) => {
        if (!isActive) {
          return;
        }

        const nextMemo = loadedMemo ?? initialMemo;

        setMemo(nextMemo);
        setDraftBody(nextMemo.body);
        setDraftItems(nextMemo.items.map((item) => ({ ...item })));
        setNewItemText('');
        setSaveState('saved');
        setIsLoaded(true);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setSaveState('error');
        setIsLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!memo || !isLoaded || hasFocusedRef.current) {
      return;
    }

    textareaRef.current?.focus();
    hasFocusedRef.current = true;
  }, [isLoaded, memo]);

  useEffect(() => {
    if (!memo || !isLoaded) {
      return;
    }

    const savedKey = getMemoContentKey(memo.body, memo.items);
    const draftKey = getMemoContentKey(draftBody, draftItems);

    if (draftKey === savedKey) {
      setSaveState('saved');
      return;
    }

    setSaveState('saving');

    const requestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = requestId;

    const timeoutId = window.setTimeout(() => {
      const nextMemo = updateMemoContent(memo, draftBody, draftItems);

      void memoStorage
        .save(nextMemo)
        .then(() => {
          if (saveRequestIdRef.current !== requestId) {
            return;
          }

          setMemo(nextMemo);
          setSaveState('saved');
        })
        .catch(() => {
          if (saveRequestIdRef.current !== requestId) {
            return;
          }

          setSaveState('error');
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftBody, draftItems, isLoaded, memo]);

  const visibleItems = draftMemo ? getActiveMemoItems(draftMemo) : [];

  const handleAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draftMemo) {
      return;
    }

    const nextMemo = addMemoItem(draftMemo, newItemText);

    if (getMemoContentKey(nextMemo.body, nextMemo.items) === getMemoContentKey(draftMemo.body, draftMemo.items)) {
      return;
    }

    setDraftItems(nextMemo.items);
    setNewItemText('');
    newItemInputRef.current?.focus();
  };

  const handleCompleteItem = (itemId: string) => {
    if (!draftMemo) {
      return;
    }

    const nextMemo = completeMemoItem(draftMemo, itemId);

    if (getMemoContentKey(nextMemo.body, nextMemo.items) === getMemoContentKey(draftMemo.body, draftMemo.items)) {
      return;
    }

    setDraftItems(nextMemo.items);
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">simple-memo</p>
        <h1>入力を止めると、自動で保存されるメモ。</h1>
        <p className="lede">
          保存ボタンをなくして、短い入力をそのまま共有URLに残せるようにしています。
        </p>
      </section>

      <section className="memo-card" aria-label="memo editor">
        <div className="memo-header">
          <div>
            <p className="memo-label">Memo</p>
            <strong>{memo?.title ?? '読み込み中'}</strong>
            <div className="memo-path">{createMemoPath(memoId)}</div>
          </div>
          <span className="status-pill" data-state={saveState}>
            {getStatusLabel(saveState)}
          </span>
        </div>

        <div className="memo-editor">
          <label htmlFor="memo-input">メモ本文</label>
          <textarea
            id="memo-input"
            ref={textareaRef}
            disabled={!memo || saveState === 'loading'}
            value={draftBody}
            onChange={(event) => {
              setDraftBody(event.target.value);
            }}
            placeholder="ページを開いたら、そのまま入力できます。"
          />
          <p className="memo-meta">最終保存: {formatSavedAt(memo?.updatedAt)}</p>
        </div>

        <form className="item-form" onSubmit={handleAddItem}>
          <label htmlFor="item-input">買い物項目を追加</label>
          <div className="item-form-row">
            <input
              id="item-input"
              ref={newItemInputRef}
              disabled={!draftMemo || saveState === 'loading'}
              value={newItemText}
              onChange={(event) => {
                setNewItemText(event.target.value);
              }}
              placeholder="例: りんご"
            />
            <button
              type="submit"
              disabled={!draftMemo || saveState === 'loading' || newItemText.trim().length === 0}
            >
              追加
            </button>
          </div>
        </form>

        <div className="memo-list" aria-label="shopping checklist">
          <p className="memo-label">買い物項目</p>
          {visibleItems.length > 0 ? (
            <ul>
              {visibleItems.map((item: MemoItem) => (
                <li key={item.id} className="memo-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {
                        handleCompleteItem(item.id);
                      }}
                    />
                    <span>{item.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">表示中の項目はありません。</p>
          )}
        </div>
      </section>
    </main>
  );
}
