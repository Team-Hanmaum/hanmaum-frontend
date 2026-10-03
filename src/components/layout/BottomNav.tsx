import { NavItem } from "./NavItem";
import { FixedBottomArea, type FixedBottomAreaProps } from "./FixedBottomArea";
export type BottomNavTab = "home" | "care" | "news" | "family" | "all";
export type BottomNavProps = {
  active: BottomNavTab;
  position?: FixedBottomAreaProps["position"];
  className?: string;
} & (
  | { destinations: Record<BottomNavTab, string>; onNavigate?: never }
  | { destinations?: never; onNavigate: (tab: BottomNavTab) => void }
);
const tabs = [
  {
    value: "home",
    label: "홈",
    icon: "home-secondary",
    selectedIcon: "home-brand",
  },
  {
    value: "care",
    label: "돌봄",
    icon: "care-secondary",
    selectedIcon: "care-brand",
  },
  {
    value: "news",
    label: "소식",
    icon: "news-secondary",
    selectedIcon: "news-brand",
  },
  {
    value: "family",
    label: "가족",
    icon: "family-secondary",
    selectedIcon: "family-brand",
  },
  {
    value: "all",
    label: "전체",
    icon: "grid-secondary",
    selectedIcon: "grid-brand",
  },
] as const;
export function BottomNav({
  active,
  position,
  className = "",
  ...navigation
}: BottomNavProps) {
  return (
    <FixedBottomArea
      position={position}
      className={className}
    >
      <nav
        aria-label="주요 메뉴"
        className="flex w-full gap-0 bg-hm-bg-surface pt-hm-8 pb-[calc(var(--hm-spacing-20)+env(safe-area-inset-bottom))]"
      >
        {tabs.map(({ value, ...tab }) => (
          <NavItem
            key={value}
            {...tab}
            selected={value === active}
            {...(navigation.destinations
              ? { href: navigation.destinations[value] }
              : { onClick: () => navigation.onNavigate(value) })}
          />
        ))}
      </nav>
    </FixedBottomArea>
  );
}
