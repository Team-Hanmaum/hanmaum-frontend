import type { ReactNode } from "react";
import { BrandSymbol, Icon, IconButton } from "@/components/ui";

type HeaderCommon = { actions?: ReactNode; className?: string };
type MainHeader = HeaderCommon & {
  variant: "main";
  brandName?: string;
  space?: {
    name: string;
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
  return (
    <header
      className={`flex min-h-16 w-full items-center gap-hm-8 bg-hm-bg-surface px-hm-20 py-hm-10 ${props.className ?? ""}`}
    >
      {props.variant === "main" ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-hm-12 text-hm-heading-section text-hm-text-brand">
            <BrandSymbol decorative />
            <span className="truncate">{props.brandName ?? "한마음"}</span>
          </div>
          {props.space && (
            <button
              type="button"
              onClick={props.space.onClick}
              aria-label={`돌봄 공간 선택: ${props.space.name}`}
              aria-expanded={props.space.expanded}
              aria-controls={props.space.controls}
              className="hm-focus-ring flex min-h-hm-touch-min w-41 min-w-0 shrink items-center gap-hm-8 rounded-hm-full bg-hm-bg-subtle px-hm-12 py-hm-8 text-hm-body-small"
            >
              <span className="min-w-0 flex-1 truncate">
                {props.space.name}
              </span>
              <Icon name="chevron-down-secondary" />
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
