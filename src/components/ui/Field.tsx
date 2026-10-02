import { useId, type ComponentPropsWithRef } from "react";
import { Icon } from "./Icon";
import "./field.css";

type FieldContent = {
  label: string;
  helper?: string;
  error?: string;
  disabledReason?: string;
  className?: string;
};

type SingleField = Omit<
  ComponentPropsWithRef<"input">,
  "children" | "size" | "type"
> & {
  multiline?: false;
  type?: "text" | "email" | "password" | "search" | "tel" | "url" | "number";
};
type MultilineField = ComponentPropsWithRef<"textarea"> & { multiline: true };

export type FieldProps = FieldContent & (SingleField | MultilineField);

export function Field({
  label,
  helper,
  error,
  disabledReason,
  className = "",
  id,
  "aria-describedby": describedBy,
  ...control
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const invalid = Boolean(error) && !control.disabled;
  const description = control.disabled
    ? (disabledReason ?? helper)
    : error || helper;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const shared = {
    id: controlId,
    className: "hm-field-control",
    "aria-invalid": invalid || control["aria-invalid"],
    "aria-describedby":
      [describedBy, descriptionId].filter(Boolean).join(" ") || undefined,
  };

  let input;
  if (control.multiline) {
    const { multiline, ...nativeProps } = control;
    input = (
      <textarea
        {...nativeProps}
        {...shared}
        data-multiline={multiline}
      />
    );
  } else {
    const { multiline, type = "text", ...nativeProps } = control;
    input = (
      <input
        {...nativeProps}
        {...shared}
        type={type}
        data-multiline={multiline || undefined}
      />
    );
  }

  return (
    <div className={`hm-field ${className}`}>
      <label
        htmlFor={controlId}
        className="text-hm-body-emphasis text-hm-text-primary"
      >
        {label}
      </label>
      {input}
      {description && (
        <div
          id={descriptionId}
          className={`flex items-start gap-hm-8 text-hm-body-small ${invalid ? "text-hm-feedback-error-text" : "text-hm-text-secondary"}`}
          role={invalid ? "alert" : undefined}
        >
          {invalid && <Icon name="alert" />}
          <p className="min-w-0 wrap-anywhere">{description}</p>
        </div>
      )}
    </div>
  );
}
