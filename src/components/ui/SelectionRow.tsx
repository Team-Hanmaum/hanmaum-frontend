import { useId, type ComponentPropsWithRef } from "react";
import { Icon } from "./Icon";
import "./selection-row.css";
type NativeInput = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "children" | "size"
>;
export type SelectionRowProps = NativeInput & {
  label: string;
  description?: string;
} & ({ control: "radio"; name: string } | { control?: "checkbox" });
export function SelectionRow({
  label,
  description,
  control = "checkbox",
  className = "",
  id,
  disabled,
  "aria-describedby": describedBy,
  "aria-labelledby": labelledBy,
  ...props
}: SelectionRowProps) {
  const generatedId = useId();
  const inputId = id ?? `selection-${generatedId}`;
  const labelId = `${inputId}-label`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <label
      className={`hm-selection-row ${className}`}
      htmlFor={inputId}
    >
      <input
        {...props}
        id={inputId}
        type={control}
        disabled={disabled}
        className="sr-only"
        aria-labelledby={
          labelledBy ?? (props["aria-label"] ? undefined : labelId)
        }
        aria-describedby={
          [describedBy, descriptionId].filter(Boolean).join(" ") || undefined
        }
      />
      <span
        aria-hidden="true"
        className="hm-selection-control"
        data-control={control}
      >
        {control === "checkbox" ? (
          <span className="hm-selection-mark">
            <Icon name={disabled ? "check-disabled" : "check-inverse"} />
          </span>
        ) : (
          <span className="hm-selection-dot" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-hm-4 wrap-anywhere">
        <span
          id={labelId}
          className="hm-selection-label text-hm-body-emphasis"
        >
          {label}
        </span>
        {description && (
          <span
            id={descriptionId}
            className="text-hm-caption-default text-hm-text-secondary"
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
