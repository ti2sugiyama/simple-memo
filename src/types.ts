export type MemoId = string;

export type MemoItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type MemoDocument = {
  memoId: MemoId;
  title: string;
  items: MemoItem[];
  updatedAt?: string;
};
