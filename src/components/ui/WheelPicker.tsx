import { useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import "./wheel-picker.css";

type WheelOption = { value: string; label: string };

export function WheelPicker({
  label,
  options,
  value,
  onChange,
  onScrollingChange,
  loop = false,
}: {
  label: string;
  options: readonly WheelOption[];
  value?: string;
  onChange: (value: string) => void;
  onScrollingChange?: (scrolling: boolean) => void;
  loop?: boolean;
}) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const interacted = useRef(false);
  const pointerDown = useRef(false);
  const selected = options.findIndex((option) => option.value === value);
  // 양 끝의 복제 행은 59 → 00, 12 → 1을 이어 주며 접근성 목록에서는 제외한다.
  const entries = [
    loop ? options.at(-1) : undefined,
    ...options,
    loop ? options[0] : undefined,
  ];
  const offset = 1;

  function stride() {
    const element = viewport.current;
    if (!element) return 0;
    const row = element.firstElementChild as HTMLElement | null;
    return (
      (row?.getBoundingClientRect().height ?? 0) +
      parseFloat(getComputedStyle(element).rowGap)
    );
  }
  function position(index: number) {
    viewport.current?.scrollTo({
      top: (index + offset) * stride(),
      behavior: "instant",
    });
  }
  function select(index: number) {
    clearTimeout(timer.current);
    interacted.current = false;
    const next = loop
      ? ((index % options.length) + options.length) % options.length
      : Math.max(0, Math.min(options.length - 1, index));
    onChange(options[next].value);
    position(next);
    onScrollingChange?.(false);
  }
  function settle() {
    if (!interacted.current || pointerDown.current || !viewport.current) return;
    const step = stride();
    if (!step) return;
    select(Math.round(viewport.current.scrollTop / step) - offset);
  }
  function schedule() {
    clearTimeout(timer.current);
    if (interacted.current) timer.current = setTimeout(settle, 160);
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    const current = Math.max(0, selected);
    const next: Record<string, number> = {
      ArrowUp: current - 1,
      ArrowDown: current + 1,
      Home: 0,
      End: options.length - 1,
      PageUp: current - 5,
      PageDown: current + 5,
      Enter: current,
      " ": current,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    select(next[event.key]);
  }

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const align = () => {
      const row = element.firstElementChild as HTMLElement | null;
      const step =
        (row?.getBoundingClientRect().height ?? 0) +
        parseFloat(getComputedStyle(element).rowGap);
      element.scrollTo({
        top: (Math.max(0, selected) + offset) * step,
        behavior: "instant",
      });
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(timer.current);
    };
  }, [selected, offset]);

  return (
    <div className="flex min-w-0 flex-col gap-hm-12">
      <p
        id={`${id}-label`}
        className="text-center text-hm-body-small text-hm-text-secondary"
      >
        {label}
      </p>
      <div
        ref={viewport}
        role="listbox"
        tabIndex={0}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={
          selected >= 0 ? `${id}-${selected + offset}` : undefined
        }
        className="hm-wheel-picker hm-focus-ring rounded-hm-12"
        onKeyDown={keyboard}
        onWheel={() => {
          interacted.current = true;
          onScrollingChange?.(true);
          schedule();
        }}
        onPointerDown={() => {
          interacted.current = true;
          pointerDown.current = true;
          onScrollingChange?.(true);
          clearTimeout(timer.current);
        }}
        onPointerUp={() => {
          pointerDown.current = false;
          schedule();
        }}
        onPointerCancel={() => {
          pointerDown.current = false;
          schedule();
        }}
        onPointerLeave={() => {
          pointerDown.current = false;
          schedule();
        }}
        onScroll={schedule}
      >
        {entries.map((option, index) => {
          if (!option)
            return (
              <div
                key={index}
                aria-hidden="true"
                className="hm-wheel-option pointer-events-none rounded-hm-12 bg-hm-bg-surface"
              />
            );
          const duplicate =
            loop && (index === 0 || index === entries.length - 1);
          const active = option.value === value;
          return (
            <div
              key={index}
              id={`${id}-${index}`}
              role={duplicate ? undefined : "option"}
              aria-hidden={duplicate || undefined}
              aria-selected={duplicate ? undefined : active}
              onClick={() => {
                viewport.current?.focus({ preventScroll: true });
                select(index - offset);
              }}
              className={`hm-wheel-option rounded-hm-12 ${active ? "bg-hm-bg-brand-subtle text-hm-heading-section text-hm-text-brand" : "bg-hm-bg-surface text-hm-body-default text-hm-text-secondary"}`}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
