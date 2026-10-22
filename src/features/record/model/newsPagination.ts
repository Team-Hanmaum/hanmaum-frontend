import type { RecordView } from "./recordViewTypes";

// 서버 페이지 크기가 아닌, Mock 목록에서 한 번에 펼치는 개수.
export const newsPageSize = 10;

export function readNewsVisibleCount(value: string | null, total: number) {
  const count = Number(value);
  if (
    !Number.isSafeInteger(count) ||
    count < newsPageSize ||
    count % newsPageSize
  )
    return newsPageSize;
  return Math.min(
    count,
    Math.max(newsPageSize, Math.ceil(total / newsPageSize) * newsPageSize),
  );
}

export function sortNewsRecords(records: readonly RecordView[]) {
  return [...records].sort(
    (a, b) =>
      b.createdAt - a.createdAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}
