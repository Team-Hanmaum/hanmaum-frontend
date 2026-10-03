import type { ComponentPropsWithRef } from "react";
import "./tab-item.css";
export type TabItemProps = ComponentPropsWithRef<"button"> & {
  selected?: boolean;
};
export function TabItem({
  selected = false,
  role,
  type = "button",
  className = "",
  ...props
}: TabItemProps) {
  return (
    <button
      {...props}
      role={role}
      type={type}
      aria-selected={role === "tab" ? selected : undefined}
      aria-pressed={role === "tab" ? undefined : selected}
      data-selected={selected}
      className={`hm-tab-item hm-focus-ring ${className}`}
    />
  );
}
