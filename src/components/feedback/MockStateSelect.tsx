import { useId } from "react";
import { MockNotice } from "./MockNotice";

export function MockStateSelect({
  message,
  value,
  options,
  onChange,
}: {
  message: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <MockNotice message={message}>
      <details className="w-full text-center">
        <summary className="hm-focus-ring cursor-pointer rounded-hm-5 p-hm-4">
          화면 상태 확인
        </summary>
        <div className="flex flex-wrap items-center justify-center gap-hm-8 py-hm-8">
          <label htmlFor={id}>Mock 상태</label>
          <select
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="hm-focus-ring min-h-hm-touch-min max-w-full rounded-hm-8 border border-hm-border-interactive bg-hm-bg-surface px-hm-12"
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </details>
    </MockNotice>
  );
}
