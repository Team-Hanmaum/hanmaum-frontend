import { useAppNavigate } from "@/routes/useAppNavigate";
import { useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Button, MenuRow } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { CareEvidenceList } from "@/features/careitem/ui/CareEvidenceList";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careItemPath, careHistoryPath, newsDetailPath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function CareSourcesPage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId = "" } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const navigate = useAppNavigate();
  const onBack = useBackNavigation(careItemPath(space.id, itemId));
  return (
    <ProposalPageLayout
      title="근거 보기"
      spaceId={space.id}
      onBack={onBack}
      actions={
        <Button onClick={() => void navigate(careItemPath(space.id, itemId))}>
          항목으로 돌아가기
        </Button>
      }
    >
      {!item ? (
        <EmptyState
          title="항목을 확인할 수 없어요"
          body="현재 공간의 돌봄 항목을 다시 확인해 주세요."
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {item.needsReconfirmation
              ? "남아 있는 근거"
              : `${item.title}의 근거`}
          </h1>
          <CareEvidenceList
            item={item}
            records={records}
            onSource={(id) => void navigate(newsDetailPath(space.id, id))}
          />
          <Notice
            title="근거와 현재 정보를 구분해요"
            body="이전 근거가 현재 값과 다를 수 있어요. 현재 확정된 내용과 변경 이력을 함께 확인해 주세요."
          />
          <MenuRow
            icon="clock-brand"
            title="변경 이력 보기"
            onClick={() => void navigate(careHistoryPath(space.id, itemId))}
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
