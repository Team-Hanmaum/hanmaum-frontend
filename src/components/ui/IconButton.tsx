import type { ComponentPropsWithRef } from "react";
import { Icon, type IconName } from "./Icon";
import "./button.css";

export type IconButtonProps = Omit<
  ComponentPropsWithRef<"button">,
  "children" | "aria-label"
> & {
  icon: IconName;
  label: string;
};

export function IconButton({
  icon,
  label,
  disabled = false,
  type = "button",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      disabled={disabled}
      className={`hm-icon-button hm-focus-ring ${className}`}
    >
      <Icon
        name={
          disabled && icon === "chevron-left" ? "chevron-left-disabled" : icon
        }
      />
    </button>
  );
}
