import type { ReactNode } from "react";

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
  return (
    <div
      className={`mx-auto flex min-h-svh w-full max-w-lg flex-col pt-[env(safe-area-inset-top)] ${surface === "surface" ? "bg-hm-bg-surface" : "bg-hm-bg-page"}`}
    >
      {notice}
      {header}
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
