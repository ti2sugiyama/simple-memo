export type MemoItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type MemoDocument = {
  id: string;
  title: string;
  items: MemoItem[];
  updatedAt?: string;
};
