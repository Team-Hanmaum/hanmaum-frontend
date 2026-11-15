const seoulDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function scheduleDayOffset(scheduledDate: unknown, now: Date) {
  if (
    typeof scheduledDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)
  ) {
    return undefined;
  }
  const scheduled = new Date(`${scheduledDate}T00:00:00Z`);
  if (
    !Number.isFinite(scheduled.getTime()) ||
    scheduled.toISOString().slice(0, 10) !== scheduledDate
  ) {
    return undefined;
  }

  const { year, month, day } = Object.fromEntries(
    seoulDate.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  // 서울의 날짜를 같은 UTC 자정 기준으로 비교해 시각을 제외한다.
  const today = Date.parse(`${year}-${month}-${day}T00:00:00Z`);
  const days = (scheduled.getTime() - today) / 86_400_000;
  return days >= 0 ? days : undefined;
}
