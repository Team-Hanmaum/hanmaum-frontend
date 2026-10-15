import type { ReactNode } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { MockNotice } from "@/components/feedback/MockNotice";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { SpaceBottomNavigation } from "./SpaceBottomNavigation";

export function FamilyPageLayout({
  title,
  spaceId,
  onBack,
  children,
  actions,
  tabs = false,
  preview,
}: {
  title: string;
  spaceId: string;
  onBack: () => void;
  children: ReactNode;
  actions?: ReactNode;
  tabs?: boolean;
  preview?: {
    value: string;
    options: readonly { value: string; label: string }[];
    onChange: (value: string) => void;
  };
}) {
  const message =
    "가족 관리 Mock · 실제 참여·권한 변경 없음 · 새로고침 시 초기화";
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
                active="family"
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
