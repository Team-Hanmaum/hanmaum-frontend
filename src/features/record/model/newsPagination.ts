import type { RecordView } from "./recordViewTypes";

export function sortNewsRecords(records: readonly RecordView[]) {
  return [...records].sort(
    (a, b) =>
      b.createdAt - a.createdAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}
