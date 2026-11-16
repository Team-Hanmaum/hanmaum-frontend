import { useParams, useSearchParams } from "react-router";
import { Badge, Button, TextAction } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import {
  useSelectedProposals,
  readSelectedIds,
} from "@/features/proposal/model/useSelectedProposals";
import { proposalStatusLabels } from "@/features/proposal/model/reviewLabels";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import {
  fieldLabels,
  formatServerTime,
  itemLabels,
  readCareText,
} from "@/features/careitem/model/careReadView";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useBackNavigation } from "@/routes/useBackNavigation";
import {
  proposalListPath,
  careItemPath,
  careHistoryPath,
  spacePath,
  spaceTabs,
} from "@/routes/paths";
// 결과 전용 GET은 없으므로 처리한 제안 ID로 저장된 decision을 다시 조회한다. 새로고침도 동일하게 복원한다.
export function ProposalResultPage() {
  const { space } = useSpaceContext();
  const { resultId = "" } = useParams();
  const [params] = useSearchParams();
  const fromTab = params.get("fromTab");
  const sourceTab = spaceTabs.find((tab) => tab === fromTab);
  const ids = readSelectedIds(params.get("ids") ?? resultId);
  const queries = useSelectedProposals(space.spaceId, ids);
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const status = queries[0]?.data?.status;
  const listStatus =
    status === "DECLINED"
      ? "rejected"
      : status === "INVALIDATED"
        ? "invalidated"
        : "applied";
  const back = useBackNavigation(
    withReturn(
      sourceTab
        ? proposalListPath(space.spaceId, listStatus, sourceTab)
        : proposalListPath(space.spaceId),
    ),
  );
  return (
    <ProposalPageLayout
      title="반영 결과"
      spaceId={space.spaceId}
      onBack={back}
      tabs
      activeTab={sourceTab ?? "care"}
      actions={
        <Button
          onClick={() =>
            void navigate(withReturn(spacePath(space.spaceId, "care")))
          }
        >
          돌봄에서 확인
        </Button>
      }
    >
      <h1 className="text-hm-title-page">제안 처리 결과</h1>
      {!ids.length ? (
        <EmptyState
          title="결과를 확인할 제안이 없어요"
          body="제안 목록에서 다시 선택해 주세요."
        />
      ) : (
        queries.map((query, index) => {
          if (!query.data || query.isError)
            return (
              <ReviewQueryState
                key={ids[index]}
                error={query.error}
                retry={() => void query.refetch()}
              />
            );
          const proposal = query.data;
          const { decision, status } = proposal;
          const hidden =
            status === "INVALIDATED" || proposal.redactedFields.length > 0;
          const values = hidden ? null : (decision?.appliedValues ?? null);
          const appliedTitle = readCareText(values?.title);
          const itemId = decision?.itemId;
          const itemVersion = decision?.itemVersion;
          return (
            <article
              key={ids[index]}
              className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface p-hm-16"
            >
              <div className="flex flex-wrap items-center justify-between gap-hm-8">
                <span className="text-hm-caption-default text-hm-text-secondary">
                  {itemLabels[proposal.itemType]}
                </span>
                <Badge
                  label={proposalStatusLabels[status]}
                  tone={status === "APPLIED" ? "brand" : "neutral"}
                />
              </div>
              <h2 className="text-hm-heading-section wrap-anywhere">
                {appliedTitle ?? proposal.title ?? "내용이 제거된 제안"}
              </h2>
              {decision && (
                <time
                  dateTime={decision.decidedAt}
                  className="text-hm-caption-default text-hm-text-secondary"
                >
                  {formatServerTime(decision.decidedAt)}
                </time>
              )}
              {hidden ? (
                <p className="text-hm-body-small text-hm-text-secondary">
                  제거된 내용은 가려져 있어요.
                </p>
              ) : (
                <CareFieldList
                  values={values}
                  keys={Object.keys(fieldLabels).filter(
                    (key) => key !== "title" && key !== "itemType",
                  )}
                  members={members.data}
                />
              )}
              {itemId && (
                <div className="flex flex-wrap gap-x-hm-16 pt-hm-4">
                  <TextAction
                    className="font-bold text-hm-text-brand"
                    onClick={() =>
                      void navigate(
                        withReturn(careItemPath(space.spaceId, itemId)),
                      )
                    }
                  >
                    현재 돌봄 정보 보기
                  </TextAction>
                  {itemVersion && (
                    <TextAction
                      onClick={() =>
                        void navigate(
                          withReturn(
                            careHistoryPath(space.spaceId, itemId, itemVersion),
                          ),
                        )
                      }
                    >
                      변경 이력 보기
                    </TextAction>
                  )}
                </div>
              )}
            </article>
          );
        })
      )}
    </ProposalPageLayout>
  );
}
