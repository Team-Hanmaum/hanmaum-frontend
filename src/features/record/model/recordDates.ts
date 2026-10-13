import type { RecordView } from "./recordViewTypes";

const dateKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const time = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "numeric",
  minute: "2-digit",
});
const monthDay = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
});

export const formatRecordTime = (timestamp: number) => time.format(timestamp);
export function formatRecordDate(timestamp: number) {
  return `${dateKey.format(timestamp).replaceAll("-", ".")} · ${time.format(timestamp)}`;
}

export function groupRecordsByDay(
  records: readonly RecordView[],
  now = Date.now(),
) {
  const groups = new Map<
    string,
    { id: string; label: string; records: RecordView[] }
  >();
  const today = dateKey.format(now);
  const yesterday = dateKey.format(now - 24 * 60 * 60 * 1000);
  for (const record of [...records].sort((a, b) => b.createdAt - a.createdAt)) {
    const id = dateKey.format(record.createdAt);
    const prefix = id === today ? "오늘 · " : id === yesterday ? "어제 · " : "";
    const group = groups.get(id) ?? {
      id,
      label: `${prefix}${monthDay.format(record.createdAt)}`,
      records: [],
    };
    group.records.push(record);
    groups.set(id, group);
  }
  return [...groups.values()];
}
