export type MemoId = string;

export type MemoItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type MemoDocument = {
  memoId: MemoId;
  title: string;
  body: string;
  items: MemoItem[];
  updatedAt?: string;
};
