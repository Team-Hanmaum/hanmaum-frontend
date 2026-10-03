import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (position !== "fixed" || !element) return;
    const observer = new ResizeObserver(() =>
      setHeight(element.getBoundingClientRect().height),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [position]);
  return (
    <>
      {position === "fixed" && (
        <div
          aria-hidden="true"
          style={{ height }}
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
