import { useEffect, useId, useRef, useState } from "react";
import { Header } from "@/components/layout";
import { Icon } from "@/components/ui";
import { ErrorState, LoadingState } from "@/components/feedback";
import {
  careSpaceName,
  careSpaceNameSuffix,
  type CareSpaceView,
} from "../model/careSpaceViewTypes";

export function CareSpaceMenu({
  space,
  spaces,
  state = "default",
  switchingId,
  onHome,
  onSelect,
  onAllSpaces,
  onRetry,
}: {
  space: CareSpaceView;
  spaces: CareSpaceView[];
  state?: "default" | "loading" | "error" | "switch-error";
  switchingId?: string;
  onHome: () => void;
  onSelect: (id: string) => void;
  onAllSpaces: () => void;
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const switchingName = spaces.find((item) => item.id === switchingId);
  return (
    <div
      ref={root}
      className="relative z-30"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          root.current
            ?.querySelector<HTMLButtonElement>("header button[aria-expanded]")
            ?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <Header
        variant="main"
        brandAction={{
          label: "한마음 홈으로",
          disabled: Boolean(switchingId),
          onClick: () => {
            setOpen(false);
            onHome();
          },
        }}
        space={{
          name: space.subjectLabel,
          suffix: careSpaceNameSuffix,
          expanded: open,
          controls: open ? id : undefined,
          onClick: () => setOpen(!open),
        }}
      />
      {open && (
        <div
          id={id}
          ref={panel}
          tabIndex={-1}
          role="region"
          aria-label="돌봄 공간 전환"
          className="absolute top-full right-hm-20 mt-hm-4 flex max-h-[60svh] w-50 max-w-[calc(100%-40px)] flex-col gap-hm-2 overflow-y-auto rounded-hm-12 border border-hm-border-default bg-hm-bg-surface p-hm-4 shadow-sm outline-none"
        >
          {switchingId ? (
            <div className="p-hm-16">
              <LoadingState
                variant="more"
                label={`${switchingName ? careSpaceName(switchingName) : "선택한 공간"}으로 이동 중이에요`}
              />
            </div>
          ) : state === "loading" ? (
            <div className="p-hm-16">
              <LoadingState
                variant="more"
                label="공간을 불러오고 있어요"
              />
            </div>
          ) : state === "error" || state === "switch-error" ? (
            <ErrorState
              reason="load-error"
              title={
                state === "error"
                  ? "공간을 불러오지 못했어요"
                  : "공간을 전환하지 못했어요"
              }
              body="현재 공간은 그대로예요. 다시 시도해 주세요."
              onAction={onRetry}
            />
          ) : (
            spaces.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={item.id === space.id ? "true" : undefined}
                className={`hm-focus-ring flex min-h-hm-touch-min shrink-0 items-center gap-hm-8 rounded-hm-8 px-hm-12 py-hm-8 text-left text-hm-body-small ${item.id === space.id ? "bg-hm-bg-brand-subtle text-hm-text-brand" : "text-hm-text-primary hover:bg-hm-bg-subtle"}`}
                onClick={() => {
                  if (item.id === space.id) setOpen(false);
                  else onSelect(item.id);
                }}
              >
                <span className="min-w-0 flex-1 wrap-anywhere">
                  {careSpaceName(item)}
                </span>
              </button>
            ))
          )}
          <div className="shrink-0 border-t border-hm-divider-default" />
          <button
            type="button"
            className="hm-focus-ring flex min-h-hm-touch-min shrink-0 items-center gap-hm-8 rounded-hm-8 px-hm-12 py-hm-8 text-left text-hm-body-small text-hm-text-brand hover:bg-hm-bg-subtle disabled:opacity-40"
            disabled={Boolean(switchingId)}
            onClick={() => {
              setOpen(false);
              onAllSpaces();
            }}
          >
            <span className="min-w-0 flex-1">공간 전체 보기</span>
            <Icon name="chevron-right-secondary" />
          </button>
        </div>
      )}
    </div>
  );
}
