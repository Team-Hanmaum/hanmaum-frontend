import type { ReactNode } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { MockNotice } from "@/components/feedback/MockNotice";
import { SpaceBottomNavigation } from "./SpaceBottomNavigation";
import { TextAction } from "@/components/ui";
import { useWithdrawalReturn } from "../useWithdrawalReturn";

export function AccountPageLayout({
  title,
  onBack,
  children,
  actions,
  spaceId,
  preview,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
  actions?: ReactNode;
  spaceId?: string;
  preview?: {
    value: string;
    options: readonly { value: string; label: string }[];
    onChange: (value: string) => void;
  };
}) {
  const { withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const message =
    "계정·공간 관리 Mock · 실제 API·계정 변경 없음 · 새로고침 시 초기화";
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
        (actions || spaceId) && (
          <FixedBottomArea position="fixed">
            {actions && (
              <div
                className={`flex flex-col gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 ${spaceId ? "pb-hm-24" : "pb-[calc(var(--hm-spacing-24)+env(safe-area-inset-bottom))]"}`}
              >
                {actions}
              </div>
            )}
            {spaceId && (
              <SpaceBottomNavigation
                spaceId={spaceId}
                active="all"
              />
            )}
          </FixedBottomArea>
        )
      }
    >
      {withdrawing && (
        <TextAction onClick={returnToWithdrawal}>
          탈퇴 절차로 돌아가기
        </TextAction>
      )}
      {children}
    </DetailLayout>
  );
}
