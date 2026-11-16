import type { ReactNode } from "react";
import { BrandSymbol, Icon, IconButton } from "@/components/ui";

type HeaderCommon = { actions?: ReactNode; className?: string };
type MainHeader = HeaderCommon & {
  variant: "main";
  brandName?: string;
  brandAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  space?: {
    name: string;
    suffix?: string;
    onClick: () => void;
    expanded?: boolean;
    controls?: string;
  };
};
type BackHeader = HeaderCommon & {
  variant: "back";
  title: string;
  onBack: () => void;
  backLabel?: string;
};

export type HeaderProps = MainHeader | BackHeader;

export function Header(props: HeaderProps) {
  const space = props.variant === "main" ? props.space : undefined;
  const spaceLabel = space ? `${space.name}${space.suffix ?? ""}` : undefined;
  const brand = props.variant === "main" && (
    <>
      <BrandSymbol decorative />
      <span className="truncate">{props.brandName ?? "한마음"}</span>
    </>
  );
  return (
    <header
      className={`flex min-h-16 w-full items-center gap-hm-8 bg-hm-bg-surface px-hm-20 py-hm-10 ${props.className ?? ""}`}
    >
      {props.variant === "main" ? (
        <>
          <div className="min-w-0 flex-1">
            {props.brandAction ? (
              <button
                type="button"
                aria-label={props.brandAction.label}
                onClick={props.brandAction.onClick}
                disabled={props.brandAction.disabled}
                className="hm-focus-ring flex min-h-hm-touch-min max-w-full items-center gap-hm-12 rounded-hm-8 text-left text-hm-heading-section text-hm-text-brand disabled:opacity-40"
              >
                {brand}
              </button>
            ) : (
              <div className="flex min-h-hm-touch-min items-center gap-hm-12 text-hm-heading-section text-hm-text-brand">
                {brand}
              </div>
            )}
          </div>
          {space && (
            <button
              type="button"
              onClick={space.onClick}
              aria-label={`돌봄 공간 선택: ${spaceLabel}`}
              aria-expanded={space.expanded}
              aria-controls={space.controls}
              title={spaceLabel}
              className="hm-focus-ring group flex min-h-hm-touch-min max-w-[calc(100%-6.5rem)] min-w-0 items-center gap-hm-4 rounded-hm-8 pl-hm-8 text-hm-body-emphasis hover:bg-hm-bg-subtle aria-expanded:bg-hm-bg-subtle"
            >
              <span className="min-w-0 flex-1 truncate font-normal">
                <span className="font-bold">{space.name}</span>
                {space.suffix}
              </span>
              <span className="inline-flex shrink-0 group-aria-expanded:rotate-180">
                <Icon name="chevron-down-secondary" />
              </span>
            </button>
          )}
        </>
      ) : (
        <>
          <IconButton
            icon="chevron-left"
            label={props.backLabel ?? "뒤로가기"}
            onClick={props.onBack}
          />
          <p
            className="min-w-0 flex-1 truncate text-hm-heading-section"
            title={props.title}
          >
            {props.title}
          </p>
        </>
      )}
      {props.actions && (
        <div className="flex shrink-0 items-center gap-hm-8">
          {props.actions}
        </div>
      )}
    </header>
  );
}
