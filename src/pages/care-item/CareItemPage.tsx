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
  careManagePath,
  careItemPath,
  careRequestsPath,
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
    !item.deletedAt &&
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
            onAction={(action, next) =>
              void navigate(
                `${careItemPath(space.id, item.id)}/${action}${action === "status" && next ? `?next=${next}` : ""}`,
              )
            }
            onReconfirm={() =>
              void navigate(careReconfirmPath(space.id, item.id))
            }
          />
        ) : undefined
      }
    >
      {!item || item.deletedAt ? (
        <>
          <EmptyState
            title={
              item?.deletedAt
                ? "삭제된 항목이에요"
                : "돌봄 항목을 확인할 수 없어요"
            }
            body="현재 목록에서 제외된 항목이에요. 일반 삭제의 변경 이력은 유지돼요."
            action={{
              label: "돌봄 목록 보기",
              onClick: () => void navigate(careListPath(space.id)),
            }}
          />
          {item?.deletedAt && (
            <MenuRow
              icon="clock-brand"
              title="변경 이력 보기"
              onClick={() => void navigate(careHistoryPath(space.id, item.id))}
            />
          )}
        </>
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
            {data.careChanges?.some(
              (change) =>
                change.draft.itemId === item.id &&
                change.status === "requested" &&
                (space.role === "owner" ||
                  change.author.id ===
                    space.members.find((member) => member.self)?.id),
            ) && (
              <MenuRow
                icon="news-brand"
                title="확인 중인 요청 보기"
                onClick={() =>
                  void navigate(
                    `${careRequestsPath(space.id)}?item=${encodeURIComponent(item.id)}`,
                  )
                }
              />
            )}
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
                title={`${label} 관리`}
                description={locked ? "공유 · 삭제" : "내용 변경 · 공유 · 삭제"}
                onClick={() => void navigate(careManagePath(space.id, item.id))}
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
