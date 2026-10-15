import { useNavigate, useOutletContext, useParams } from "react-router";
import { EmptyState } from "@/components/feedback";
import { MenuRow } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { getCarePendingProposals } from "@/features/proposal/model/proposalSelectors";
import { CarePendingNotice } from "@/features/proposal/ui/CarePendingNotice";
import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { careItemListFilter } from "@/features/careitem/model/careItemSelectors";
import { isConfirmedQuestion } from "@/features/careitem/model/careItemStatus";
import { useCareNow } from "@/features/careitem/model/useCareNow";
import { CareItemContent } from "@/features/careitem/ui/CareItemContent";
import { CareItemActions } from "@/features/careitem/ui/CareItemActions";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careHistoryPath,
  careSourcesPath,
  careReconfirmPath,
  newsCreatePath,
  careListPath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useCareProposalNavigation } from "@/routes/useCareProposalNavigation";

export function CareItemPage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId } = useParams();
  const data = useMockProposals(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const navigate = useNavigate();
  const now = useCareNow();
  const onBack = useBackNavigation(
    careListPath(space.id, item ? careItemListFilter(item, now) : undefined),
  );
  const onProposal = useCareProposalNavigation(space.id);
  const label = item ? careKindLabels[item.kind] : "돌봄";
  const locked = isConfirmedQuestion(item);
  const hasActions =
    item &&
    !locked &&
    (item.needsReconfirmation
      ? space.role === "owner"
      : item.kind === "task" ||
        (item.kind === "schedule" && item.status === "scheduled") ||
        (item.kind === "question" && item.status === "unconfirmed"));
  return (
    <ProposalPageLayout
      title={`${label} 상세`}
      spaceId={space.id}
      onBack={onBack}
      tabs
      activeTab="care"
      actions={
        hasActions ? (
          <CareItemActions
            item={item}
            space={space}
            onReconfirm={() =>
              void navigate(careReconfirmPath(space.id, item.id))
            }
          />
        ) : undefined
      }
    >
      {!item ? (
        <EmptyState
          title="돌봄 항목을 확인할 수 없어요"
          body="아직 반영되지 않았거나 현재 공간에 없는 항목이에요."
          action={{
            label: "돌봄 목록 보기",
            onClick: () => void navigate(careListPath(space.id)),
          }}
        />
      ) : (
        <>
          <CareItemContent
            item={item}
            space={space}
          />
          {!item.needsReconfirmation && (
            <CarePendingNotice
              proposals={getCarePendingProposals(data, item.id, space)}
              onOpen={onProposal}
            />
          )}
          <div className="divide-y divide-hm-divider-default overflow-hidden rounded-hm-16 bg-hm-bg-surface">
            <MenuRow
              icon="link-brand"
              title="근거 보기"
              description="소식 원문과 직접 확인한 근거"
              onClick={() => void navigate(careSourcesPath(space.id, item.id))}
            />
            <MenuRow
              icon="clock-brand"
              title="변경 이력"
              description="확정된 변경을 확인해요"
              onClick={() => void navigate(careHistoryPath(space.id, item.id))}
            />
            {!item.needsReconfirmation && (
              <MenuRow
                icon="edit"
                title={`${label} 관리 · 준비 중`}
                description={locked ? "공유 · 삭제" : "내용 변경 · 공유 · 삭제"}
                disabled
              />
            )}
          </div>
          {item.needsReconfirmation && (
            <MenuRow
              icon="news-brand"
              title="새 소식 남기기"
              onClick={() => void navigate(newsCreatePath(space.id))}
            />
          )}
        </>
      )}
    </ProposalPageLayout>
  );
}
