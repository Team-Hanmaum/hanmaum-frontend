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
import { ConnectedProposalCard } from "@/features/proposal/ui/ConnectedProposalCard";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
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
export function ConnectedProposalReviewPage() {
  const { space } = useConnectedSpace();
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
  const selectedIds = selected.filter((id) =>
    items.some((p) => p.proposalId === id && p.status === "REVIEW_PENDING"),
  );
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
          {space.role === "OWNER" ? "반영할 내용 확인" : "요청할 내용 확인"} ·{" "}
          {selectedIds.length}건
        </Button>
      }
    >
      <h1 className="text-hm-title-page">무엇을 반영할까요?</h1>
      <Notice
        title={
          space.role === "OWNER"
            ? "확인한 내용만 반영해요"
            : "소유자에게 반영을 요청해요"
        }
        body="최대 20개까지 선택할 수 있어요. 같은 돌봄 항목의 변경은 하나씩 확인해 주세요."
      />
      {!list.data || list.isRefetchError ? (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.refetch()}
        />
      ) : items.length ? (
        items.map((p) => (
          <ReviewCard
            key={p.proposalId}
            spaceId={space.spaceId}
            id={p.proposalId}
            selected={selectedIds.includes(p.proposalId)}
            onSelect={(checked) =>
              client.setQueryData<string[]>(key, (previous) =>
                checked
                  ? [...new Set([...(previous ?? []), p.proposalId])].slice(
                      0,
                      20,
                    )
                  : (previous ?? []).filter((id) => id !== p.proposalId),
              )
            }
          />
        ))
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
  onSelect,
}: {
  spaceId: string;
  id: string;
  selected: boolean;
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
      <ConnectedProposalCard
        proposal={proposal}
        draft={draft}
        members={members.data}
        selected={selected}
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
