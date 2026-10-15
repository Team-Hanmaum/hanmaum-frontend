import type { ReactNode } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { MockNotice } from "@/components/feedback/MockNotice";
import { SpaceBottomNavigation } from "./SpaceBottomNavigation";
import type { SpaceTab } from "../paths";

export function ProposalPageLayout({
  title,
  spaceId,
  onBack,
  children,
  actions,
  tabs = false,
  activeTab = "news",
  preview,
}: {
  title: string;
  spaceId: string;
  onBack: () => void;
  children: ReactNode;
  actions?: ReactNode;
  tabs?: boolean;
  activeTab?: SpaceTab;
  preview?: {
    value: string;
    options: readonly { value: string; label: string }[];
    onChange: (value: string) => void;
  };
}) {
  const message = "소식·돌봄 UI 예시 · 실제 요청·돌봄 정보 변경 없음";
  return (
    <DetailLayout
      title={title}
      onBack={onBack}
      notice={
        preview ? (
          <MockStateSelect
            message={message}
            {...preview}
          />
        ) : (
          <MockNotice message={message} />
        )
      }
      footer={
        (actions || tabs) && (
          <FixedBottomArea position="fixed">
            {actions && (
              <div
                className={`flex flex-col gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 ${tabs ? "pb-hm-24" : "pb-[calc(var(--hm-spacing-24)+env(safe-area-inset-bottom))]"}`}
              >
                {actions}
              </div>
            )}
            {tabs && (
              <SpaceBottomNavigation
                spaceId={spaceId}
                active={activeTab}
              />
            )}
          </FixedBottomArea>
        )
      }
    >
      {children}
    </DetailLayout>
  );
}
