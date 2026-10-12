import { useLayoutEffect, useRef, type ReactNode } from "react";

export type PageLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  notice?: ReactNode;
  footer?: ReactNode;
  surface?: "page" | "surface";
  mainClassName?: string;
};

export function PageLayout({
  children,
  header,
  notice,
  footer,
  surface = "page",
  mainClassName = "flex flex-col gap-hm-24 p-hm-20",
}: PageLayoutProps) {
  const top = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = top.current;
    if (!element) return;
    const root = document.documentElement;
    const previousPadding = root.style.scrollPaddingTop;
    const updatePadding = () => {
      // Mock 안내 펼침·줄바꿈·safe area를 포함해 포커스/앵커가 헤더 뒤에 숨지 않게 한다.
      root.style.scrollPaddingTop = `${element.getBoundingClientRect().height}px`;
    };
    updatePadding();
    const observer = new ResizeObserver(updatePadding);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.scrollPaddingTop = previousPadding;
    };
  }, []);

  return (
    <div
      className={`mx-auto flex min-h-svh w-full max-w-lg flex-col ${surface === "surface" ? "bg-hm-bg-surface" : "bg-hm-bg-page"}`}
    >
      <div
        ref={top}
        className="sticky top-0 z-30 shrink-0 bg-hm-bg-surface pt-[env(safe-area-inset-top)]"
      >
        {notice}
        {header}
      </div>
      <main
        tabIndex={-1}
        className={`min-w-0 flex-1 outline-none ${mainClassName}`}
      >
        {children}
      </main>
      <div className="shrink-0">
        {footer ?? <div className="h-[env(safe-area-inset-bottom)]" />}
      </div>
    </div>
  );
}
