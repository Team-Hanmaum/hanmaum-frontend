import { useParams, useSearchParams } from "react-router";
import { Badge, Button } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import {
  useSelectedProposals,
  readSelectedIds,
} from "@/features/proposal/model/useSelectedProposals";
import { proposalStatusLabels } from "@/features/proposal/model/reviewLabels";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useBackNavigation } from "@/routes/useBackNavigation";
import {
  proposalListPath,
  careItemPath,
  careHistoryPath,
  spacePath,
} from "@/routes/paths";
// 결과 전용 GET은 없으므로 처리한 제안 ID로 저장된 decision을 다시 조회한다. 새로고침도 동일하게 복원한다.
export function ConnectedProposalResultPage() {
  const { space } = useConnectedSpace();
  const { resultId = "" } = useParams();
  const [params] = useSearchParams();
  const ids = readSelectedIds(params.get("ids") ?? resultId);
  const queries = useSelectedProposals(space.spaceId, ids);
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const back = useBackNavigation(withReturn(proposalListPath(space.spaceId)));
  return (
    <ProposalPageLayout
      title="반영 결과"
      spaceId={space.spaceId}
      onBack={back}
      tabs
      activeTab="care"
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
        queries.map((query, index) =>
          !query.data || query.isError ? (
            <ReviewQueryState
              key={ids[index]}
              error={query.error}
              retry={() => void query.refetch()}
            />
          ) : (
            <article
              key={ids[index]}
              className="flex flex-col gap-hm-16 rounded-hm-14 bg-hm-bg-surface p-hm-20"
            >
              <Badge label={proposalStatusLabels[query.data.status]} />
              <h2 className="text-hm-heading-section">
                {query.data.title ?? "내용이 제거된 제안"}
              </h2>
              {query.data.status === "INVALIDATED" ? (
                <Notice
                  title="제거된 내용은 표시하지 않아요"
                  body="결정 시각과 대상 정보만 확인할 수 있어요."
                />
              ) : (
                <CareValuesView
                  values={query.data.decision?.appliedValues ?? null}
                  members={members.data}
                />
              )}
              {query.data.decision?.itemId && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void navigate(
                        withReturn(
                          careItemPath(
                            space.spaceId,
                            query.data!.decision!.itemId!,
                          ),
                        ),
                      )
                    }
                  >
                    현재 돌봄 정보 보기
                  </Button>
                  {query.data.decision.itemVersion && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void navigate(
                          withReturn(
                            careHistoryPath(
                              space.spaceId,
                              query.data!.decision!.itemId!,
                              query.data!.decision!.itemVersion!,
                            ),
                          ),
                        )
                      }
                    >
                      이 변경 이력 보기
                    </Button>
                  )}
                </>
              )}
            </article>
          ),
        )
      )}
    </ProposalPageLayout>
  );
}
