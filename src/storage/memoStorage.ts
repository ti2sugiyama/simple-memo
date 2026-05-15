import type { MemoDocument, MemoId } from '../types';

export type MemoStorage = {
  load: (memoId: MemoId) => Promise<MemoDocument | null>;
  save: (memo: MemoDocument) => Promise<void>;
};

export const createInMemoryMemoStorage = (seed: MemoDocument[] = []): MemoStorage => {
  const records = new Map<MemoId, MemoDocument>(
    seed.map((memo) => [memo.memoId, { ...memo, items: memo.items.map((item) => ({ ...item })) }]),
  );

  return {
    async load(memoId) {
      const memo = records.get(memoId);

      if (!memo) {
        return null;
      }

      return {
        ...memo,
        items: memo.items.map((item) => ({ ...item })),
      };
    },
    async save(memo) {
      records.set(memo.memoId, {
        ...memo,
        items: memo.items.map((item) => ({ ...item })),
      });
    },
  };
};
