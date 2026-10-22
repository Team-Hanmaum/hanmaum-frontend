import type { CareItemView } from "./careItemViewTypes";
import type { CareListFilter } from "./careItemSelectors";

// 날짜만 있는 필드는 시간대로 변환하지 않고 달력 날짜끼리 비교한다.
function dateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date.getTime()
    : undefined;
}

function timeKey(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return undefined;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

// 미정·잘못된 값은 오름차순과 내림차순 모두 마지막에 둔다.
function compareNumber(
  a: number | undefined,
  b: number | undefined,
  direction = 1,
) {
  const left = a !== undefined && Number.isFinite(a) ? a : undefined;
  const right = b !== undefined && Number.isFinite(b) ? b : undefined;
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  return (left - right) * direction;
}

function comparePrimary(
  a: CareItemView,
  b: CareItemView,
  filter: CareListFilter,
) {
  switch (filter.type) {
    case "schedule": {
      if (filter.status === "closed")
        return compareNumber(a.statusChangedAt, b.statusChangedAt, -1);
      const direction = filter.status === "past" ? -1 : 1;
      const left = dateKey(a.fields.date);
      const right = dateKey(b.fields.date);
      return (
        compareNumber(left, right, direction) ||
        (left !== undefined && right !== undefined
          ? compareNumber(
              timeKey(a.fields.time),
              timeKey(b.fields.time),
              direction,
            )
          : 0)
      );
    }
    case "task":
      if (filter.status === "completed")
        return compareNumber(a.statusChangedAt, b.statusChangedAt, -1);
      return (
        compareNumber(dateKey(a.fields.dueDate), dateKey(b.fields.dueDate)) ||
        Number(b.status === "in-progress") - Number(a.status === "in-progress")
      );
    case "question":
      return filter.status === "confirmed"
        ? compareNumber(a.statusChangedAt, b.statusChangedAt, -1)
        : compareNumber(a.createdAt, b.createdAt);
    case "observation":
    case "guidance":
      return compareNumber(dateKey(a.fields.date), dateKey(b.fields.date), -1);
  }
}

export function sortCareItems(
  items: readonly CareItemView[],
  filter: CareListFilter,
) {
  return [...items].sort(
    (a, b) =>
      comparePrimary(a, b, filter) ||
      compareNumber(a.createdAt, b.createdAt) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}
