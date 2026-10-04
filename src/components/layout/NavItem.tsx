import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui";
import "@/components/ui/focus-ring.css";
export type NavItemProps = {
  renderLink?: (
    props: ComponentPropsWithoutRef<"a"> & { href: string },
  ) => ReactNode;
  label: string;
  icon: IconName;
  selectedIcon?: IconName;
  selected?: boolean;
  className?: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });
export function NavItem({
  label,
  icon,
  selectedIcon = icon,
  selected = false,
  className = "",
  renderLink,
  ...action
}: NavItemProps) {
  const content = (
    <>
      <span
        className={`inline-flex h-7 w-10 shrink-0 items-center justify-center rounded-hm-full ${selected ? "bg-hm-bg-brand-subtle" : ""}`}
      >
        <Icon name={selected ? selectedIcon : icon} />
      </span>
      <span
        className={`w-full text-center wrap-anywhere ${selected ? "text-hm-navigation-selected text-hm-text-brand" : "text-hm-navigation-default text-hm-text-secondary"}`}
      >
        {label}
      </span>
    </>
  );
  const classes = `hm-focus-ring flex min-h-hm-control min-w-0 flex-1 flex-col items-center justify-center gap-hm-4 bg-hm-bg-surface ${className}`;
  if (action.href !== undefined && renderLink) {
    return renderLink({
      href: action.href,
      "aria-current": selected ? "page" : undefined,
      className: classes,
      children: content,
    });
  }
  return action.href !== undefined ? (
    <a
      href={action.href}
      aria-current={selected ? "page" : undefined}
      className={classes}
    >
      {content}
    </a>
  ) : (
    <button
      type="button"
      onClick={action.onClick}
      aria-current={selected ? "page" : undefined}
      className={classes}
    >
      {content}
    </button>
  );
}
