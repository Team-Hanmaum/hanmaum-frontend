import type { ReactNode } from "react";
import { Header } from "./Header";
import { PageLayout, type PageLayoutProps } from "./PageLayout";

export type DetailLayoutProps = Omit<PageLayoutProps, "header"> & {
  title: string;
  onBack: () => void;
  actions?: ReactNode;
};

export function DetailLayout({
  title,
  onBack,
  actions,
  ...props
}: DetailLayoutProps) {
  return (
    <PageLayout
      {...props}
      header={
        <Header
          variant="back"
          title={title}
          onBack={onBack}
          actions={actions}
        />
      }
    />
  );
}
