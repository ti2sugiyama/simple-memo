import type { MemoDocument, MemoId, MemoItem } from '../types';

const MEMO_ID_PATTERN = /^[a-z0-9_-]+$/i;

export const createMemoId = (): MemoId => {
  const bytes = new Uint8Array(8);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
};

export const readMemoIdFromPathname = (pathname: string): MemoId | null => {
  const firstSegment = pathname.split('/').find((segment) => segment.length > 0);

  if (!firstSegment || !MEMO_ID_PATTERN.test(firstSegment)) {
    return null;
  }

  return firstSegment;
};

export const createMemoPath = (memoId: MemoId): string => `/${memoId}`;

export const resolveMemoIdFromPathname = (pathname: string): MemoId => {
  const memoId = readMemoIdFromPathname(pathname);

  return memoId ?? createMemoId();
};

export const createMemoDocument = (
  memoId: MemoId,
  title: string,
  body = '',
  items: MemoItem[] = [],
  updatedAt?: string,
): MemoDocument => ({
  memoId,
  title,
  body,
  items: items.map((item) => ({ ...item })),
  updatedAt,
});

export const updateMemoBody = (memo: MemoDocument, body: string): MemoDocument => ({
  ...memo,
  body,
  updatedAt: new Date().toISOString(),
});

export const updateMemoContent = (
  memo: MemoDocument,
  body: string,
  items: MemoItem[],
): MemoDocument => ({
  ...memo,
  body,
  items: items.map((item) => ({ ...item })),
  updatedAt: new Date().toISOString(),
});

export const addMemoItem = (memo: MemoDocument, text: string): MemoDocument => {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return memo;
  }

  return {
    ...memo,
    items: [
      ...memo.items.map((item) => ({ ...item })),
      {
        id: createMemoId(),
        text: normalizedText,
        checked: false,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
};

export const completeMemoItem = (memo: MemoDocument, itemId: string): MemoDocument => {
  let hasChanges = false;

  const items = memo.items.map((item) => {
    if (item.id !== itemId || item.checked) {
      return { ...item };
    }

    hasChanges = true;

    return {
      ...item,
      checked: true,
    };
  });

  if (!hasChanges) {
    return memo;
  }

  return {
    ...memo,
    items,
    updatedAt: new Date().toISOString(),
  };
};

export const getActiveMemoItems = (memo: MemoDocument): MemoItem[] =>
  memo.items.filter((item) => !item.checked).map((item) => ({ ...item }));
