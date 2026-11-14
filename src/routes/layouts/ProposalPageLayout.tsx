import type { ReactNode } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { SpaceBottomNavigation } from "./SpaceBottomNavigation";
import type { SpaceTab } from "../paths";
import { TextAction } from "@/components/ui";
import { useWithdrawalReturn } from "../useWithdrawalReturn";

export function ProposalPageLayout({
  title,
  spaceId,
  onBack,
  children,
  actions,
  tabs = false,
  activeTab = "news",
}: {
  title: string;
  spaceId: string;
  onBack: () => void;
  children: ReactNode;
  actions?: ReactNode;
  tabs?: boolean;
  activeTab?: SpaceTab;
}) {
  const { withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  return (
    <DetailLayout
      title={title}
      onBack={onBack}
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
      {withdrawing && (
        <TextAction onClick={returnToWithdrawal}>
          탈퇴 절차로 돌아가기
        </TextAction>
      )}
      {children}
    </DetailLayout>
  );
}
