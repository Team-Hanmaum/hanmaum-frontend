import type { ReactNode } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { SpaceBottomNavigation } from "./SpaceBottomNavigation";

export function FamilyPageLayout({
  title,
  spaceId,
  onBack,
  children,
  actions,
  tabs = false,
}: {
  title: string;
  spaceId: string;
  onBack: () => void;
  children: ReactNode;
  actions?: ReactNode;
  tabs?: boolean;
}) {
  return (
    <DetailLayout
      title={title}
      onBack={onBack}
      footer={
        (actions || tabs) && (
          <FixedBottomArea position="fixed">
            {actions && (
              <div
                className={`grid auto-cols-fr grid-flow-col gap-hm-8 bg-hm-bg-surface px-hm-20 pt-hm-16 [&>.hm-button]:px-hm-8 ${tabs ? "pb-hm-8" : "pb-[calc(var(--hm-spacing-24)+env(safe-area-inset-bottom))]"}`}
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
