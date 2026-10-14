import { useState, type KeyboardEvent } from "react";
import { IconButton } from "./IconButton";

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const initial = value ? new Date(`${value}T12:00:00`) : new Date();
  const [month, setMonth] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const [focused, setFocused] = useState(value || dateKey(initial));
  const start = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - ((month.getDay() + 6) % 7),
  );
  const days = Array.from(
    { length: 42 },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    const offsets: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
      Home: -(date.getDay() + 6) % 7,
      End: 6 - ((date.getDay() + 6) % 7),
    };
    if (!(event.key in offsets)) return;
    event.preventDefault();
    const next = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + offsets[event.key],
    );
    const key = dateKey(next);
    setFocused(key);
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    const container = event.currentTarget.closest("[data-calendar]");
    requestAnimationFrame(() =>
      container
        ?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)
        ?.focus(),
    );
  }
  function changeMonth(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setFocused(dateKey(next));
  }
  return (
    <div
      data-calendar
      className="rounded-hm-16 bg-hm-bg-surface p-hm-8"
    >
      <div className="mb-hm-16 flex items-center justify-between">
        <IconButton
          icon="chevron-left"
          label="이전 달"
          onClick={() => changeMonth(-1)}
        />
        <p
          className="text-hm-heading-section"
          aria-live="polite"
        >
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </p>
        <IconButton
          icon="chevron-right"
          label="다음 달"
          onClick={() => changeMonth(1)}
        />
      </div>
      <div className="grid grid-cols-7 text-center">
        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
          <span
            key={day}
            className="py-hm-8 text-hm-caption-default text-hm-text-secondary"
          >
            {day}
          </span>
        ))}
        {days.map((date) => {
          const key = dateKey(date);
          return (
            <button
              key={key}
              type="button"
              data-date={key}
              tabIndex={focused === key ? 0 : -1}
              aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
              aria-pressed={value === key}
              onKeyDown={(event) => keyboard(event, date)}
              onClick={() => {
                setFocused(key);
                onChange(key);
              }}
              className={`hm-focus-ring min-h-11 rounded-hm-10 text-hm-body-default ${value === key ? "bg-hm-action-primary text-hm-text-inverse" : date.getMonth() === month.getMonth() ? "text-hm-text-primary" : "text-hm-text-secondary"}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
