import { useParams } from "react-router";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import { useSession } from "@/features/auth/model/useSession";
import {
  useProposalList,
  useProposal,
} from "@/features/proposal/model/useProposalQueries";
import { useProposalDrafts } from "@/features/proposal/model/useProposalDrafts";
import { initialProposalDraft } from "@/features/proposal/model/proposalDraft";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ProposalCard } from "@/features/proposal/ui/ProposalCard";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  proposalConfirmPath,
  proposalEditPath,
  proposalTargetPath,
  proposalEvidencePath,
  newsDetailPath,
} from "@/routes/paths";

const selectionLimit = 20;

export function ProposalReviewPage() {
  const { space } = useSpaceContext();
  const { recordId = "" } = useParams();
  const list = useProposalList(space.spaceId, "REVIEW_PENDING", recordId);
  const session = useSession();
  const client = useQueryClient();
  const key = ["review-selection", session.accountId, space.spaceId, recordId];
  const { data: selected = [] } = useQuery<string[]>({
    queryKey: key,
    queryFn: skipToken,
    initialData: [],
    enabled: false,
  });
  const { withReturn } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const back = useBackNavigation(
    withReturn(newsDetailPath(space.spaceId, recordId)),
  );
  const items = [
    ...new Map(
      (list.data?.pages ?? [])
        .flatMap((p) => p.items)
        .map((p) => [p.proposalId, p]),
    ).values(),
  ];
  const pendingIds = new Set(
    items.filter((p) => p.status === "REVIEW_PENDING").map((p) => p.proposalId),
  );
  const selectedIds = selected.filter((id) => pendingIds.has(id));
  const limitReached = selectedIds.length >= selectionLimit;
  const checking = !list.data || list.isRefetchError;
  const confirmLabel =
    space.role === "OWNER" ? "반영할 내용 확인" : "요청할 내용 확인";
  return (
    <ProposalPageLayout
      title="제안 검토"
      spaceId={space.spaceId}
      onBack={back}
      actions={
        <Button
          disabled={!selectedIds.length || list.isError}
          onClick={() =>
            void navigate(
              withReturn(
                `${proposalConfirmPath(space.spaceId)}?ids=${selectedIds.map(encodeURIComponent).join(",")}`,
              ),
            )
          }
        >
          {confirmLabel}
          {selectedIds.length > 0 && ` · ${selectedIds.length}건`}
        </Button>
      }
    >
      <div className="flex flex-col gap-hm-4">
        <h1 className="text-hm-title-page">이 소식의 제안</h1>
        {!checking && items.length > 0 && (
          <p className="text-hm-body-small text-hm-text-secondary">
            {list.hasNextPage ? "불러온 제안" : "검토할 제안"} {items.length}건
          </p>
        )}
      </div>
      {checking ? (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.refetch()}
        />
      ) : items.length ? (
        <div className="flex flex-col gap-hm-12">
          {items.map((p) => (
            <ReviewCard
              key={p.proposalId}
              spaceId={space.spaceId}
              id={p.proposalId}
              selected={selectedIds.includes(p.proposalId)}
              limitReached={limitReached}
              onSelect={(checked) =>
                client.setQueryData<string[]>(key, (previous) => {
                  const current = (previous ?? []).filter(
                    (id) => pendingIds.has(id) && id !== p.proposalId,
                  );
                  return checked && current.length < selectionLimit
                    ? [...current, p.proposalId]
                    : current;
                })
              }
            />
          ))}
          {limitReached && (
            <p
              role="status"
              className="text-hm-body-small text-hm-text-secondary"
            >
              한 번에 최대 {selectionLimit}건까지 선택할 수 있어요.
            </p>
          )}
        </div>
      ) : (
        <EmptyState
          title="검토할 제안이 없어요"
          body="이미 처리되었거나 분석 결과에 반영할 제안이 없어요."
        />
      )}
      {list.hasNextPage && (
        <Button
          variant="secondary"
          loading={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          제안 더 보기
        </Button>
      )}
      {list.isFetchNextPageError && (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.fetchNextPage()}
        />
      )}
    </ProposalPageLayout>
  );
}
function ReviewCard({
  spaceId,
  id,
  selected,
  limitReached,
  onSelect,
}: {
  spaceId: string;
  id: string;
  selected: boolean;
  limitReached: boolean;
  onSelect: (checked: boolean) => void;
}) {
  const query = useProposal(spaceId, id);
  const { drafts } = useProposalDrafts(spaceId);
  const members = useSpaceMembers(spaceId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  if (!query.data || query.isError)
    return (
      <ReviewQueryState
        error={query.error}
        retry={() => void query.refetch()}
      />
    );
  const proposal = query.data;
  const saved = drafts[id];
  const draft =
    saved?.reviewToken === proposal.reviewToken
      ? saved
      : initialProposalDraft(proposal);
  return (
    <>
      {saved && saved.reviewToken !== proposal.reviewToken && (
        <Notice
          title="제안이 바뀌어 수정 초안을 제외했어요"
          body="최신 내용으로 다시 검토해 주세요."
        />
      )}
      <ProposalCard
        proposal={proposal}
        draft={draft}
        members={members.data}
        selected={selected}
        selectionDisabled={limitReached && !selected}
        onSelect={onSelect}
        onEdit={() => void navigate(withReturn(proposalEditPath(spaceId, id)))}
        onTarget={() =>
          void navigate(withReturn(proposalTargetPath(spaceId, id)))
        }
        onEvidence={() =>
          void navigate(withReturn(proposalEvidencePath(spaceId, id)))
        }
        onRecord={(record) =>
          void navigate(withReturn(newsDetailPath(spaceId, record)))
        }
      />
    </>
  );
}
