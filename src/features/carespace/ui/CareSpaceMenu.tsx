import { useEffect, useId, useRef, useState } from "react";
import { Header } from "@/components/layout";
import { Button, Icon } from "@/components/ui";
import { ErrorState, LoadingState } from "@/components/feedback";
import { careSpaceName, type CareSpaceView } from "../model/careSpaceViewTypes";

export function CareSpaceMenu({
  space,
  spaces,
  state = "default",
  switchingId,
  onSelect,
  onAllSpaces,
  onRetry,
}: {
  space: CareSpaceView;
  spaces: CareSpaceView[];
  state?: "default" | "loading" | "error" | "switch-error";
  switchingId?: string;
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
            ?.querySelector<HTMLButtonElement>("header button")
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
        space={{
          name: careSpaceName(space),
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
          className="absolute top-full right-hm-20 mt-hm-8 flex max-h-[60svh] w-70 max-w-[calc(100%-40px)] flex-col gap-hm-4 overflow-y-auto rounded-hm-12 border border-hm-border-default bg-hm-bg-surface p-hm-8 outline-none"
        >
          <p className="px-hm-16 text-hm-body-small text-hm-text-secondary">
            돌봄 공간
          </p>
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
                className={`hm-focus-ring flex min-h-18 items-center gap-hm-12 rounded-hm-8 p-hm-16 text-left text-hm-body-emphasis wrap-anywhere ${item.id === space.id ? "bg-hm-bg-brand-subtle text-hm-text-brand" : "text-hm-text-primary"}`}
                onClick={() => {
                  if (item.id === space.id) setOpen(false);
                  else onSelect(item.id);
                }}
              >
                {item.id === space.id ? (
                  <Icon name="check" />
                ) : (
                  <span
                    className="size-6 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {careSpaceName(item)}
              </button>
            ))
          )}
          <div className="border-t border-hm-border-default" />
          <Button
            variant="secondary"
            disabled={Boolean(switchingId)}
            onClick={() => {
              setOpen(false);
              onAllSpaces();
            }}
          >
            공간 전체 보기
          </Button>
        </div>
      )}
    </div>
  );
}
