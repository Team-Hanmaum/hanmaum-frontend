import { useParams } from "react-router";
import { Button } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { useProposal } from "@/features/proposal/model/useProposalQueries";
import { initialProposalDraft } from "@/features/proposal/model/proposalDraft";
import { ConnectedProposalCard } from "@/features/proposal/ui/ConnectedProposalCard";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { proposalListPath, newsDetailPath } from "@/routes/paths";
export function ConnectedProposalEvidencePage() {
  const { space } = useConnectedSpace();
  const { proposalId = "" } = useParams();
  const query = useProposal(space.spaceId, proposalId);
  const { withReturn } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const back = useBackNavigation(withReturn(proposalListPath(space.spaceId)));
  return (
    <ProposalPageLayout
      connected
      title="근거 비교"
      spaceId={space.spaceId}
      onBack={back}
    >
      {!query.data || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <ConnectedProposalCard
            proposal={query.data}
            draft={initialProposalDraft(query.data)}
            readonly
            onRecord={(id) =>
              void navigate(withReturn(newsDetailPath(space.spaceId, id)))
            }
          />
          {query.data.status !== "INVALIDATED" &&
            query.data.comparisonBasis.map((b) => (
              <section
                key={b.basisId}
                className="flex flex-col gap-hm-12 rounded-hm-14 bg-hm-bg-surface p-hm-20"
              >
                <h2 className="text-hm-heading-section">비교에 사용한 근거</h2>
                <p className="text-hm-body-default whitespace-pre-wrap">
                  {b.text ?? "내용이 제거되었어요."}
                </p>
                {b.recordId && b.text && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void navigate(
                        withReturn(newsDetailPath(space.spaceId, b.recordId!)),
                      )
                    }
                  >
                    소식 원본 보기
                  </Button>
                )}
              </section>
            ))}
          <Notice
            title="근거를 비교한 뒤 결정해 주세요"
            body="AI 분석 내용은 검토 전까지 현재 돌봄 정보에 반영되지 않아요."
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
