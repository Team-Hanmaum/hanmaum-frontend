import type { ComponentPropsWithRef } from "react";
import "./text-action.css";
export type TextActionProps = ComponentPropsWithRef<"button"> & {
  tone?: "default" | "danger";
};
export function TextAction({
  tone = "default",
  type = "button",
  className = "",
  ...props
}: TextActionProps) {
  return (
    <button
      {...props}
      type={type}
      data-tone={tone}
      className={`hm-text-action hm-focus-ring ${className}`}
    />
  );
}
