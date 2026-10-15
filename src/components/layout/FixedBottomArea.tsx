import { useLayoutEffect, useRef, type ReactNode } from "react";
export type FixedBottomAreaProps = {
  children: ReactNode;
  position?: "static" | "fixed";
  className?: string;
};
export function FixedBottomArea({
  children,
  position = "static",
  className = "",
}: FixedBottomAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (position !== "fixed" || !element) return;
    // 라우터의 스크롤 복원 전에 실제 높이를 예약한다. 첫 ResizeObserver
    // 알림을 기다리면 목록 하단으로 복귀할 때 스크롤 위치가 위로 잘린다.
    const measure = () => {
      if (spacer.current)
        spacer.current.style.height = `${element.getBoundingClientRect().height}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [position]);
  return (
    <>
      {position === "fixed" && (
        <div
          aria-hidden="true"
          ref={spacer}
        />
      )}
      <div
        ref={ref}
        className={`${position === "fixed" ? "fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-lg" : "w-full"} ${className}`}
      >
        {children}
      </div>
    </>
  );
}
