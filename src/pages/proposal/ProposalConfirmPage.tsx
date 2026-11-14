import { useRef } from "react";
import { useSearchParams } from "react-router";
import { Button, TextAction } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import {
  useSelectedProposals,
  readSelectedIds,
} from "@/features/proposal/model/useSelectedProposals";
import { useProposalDrafts } from "@/features/proposal/model/useProposalDrafts";
import {
  initialProposalDraft,
  proposalDraftProblem,
  proposalInputValues,
} from "@/features/proposal/model/proposalDraft";
import { useReviewLeases } from "@/features/careitem/model/useReviewLeases";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import {
  applyProposals,
  declineProposals,
  submitProposalRequest,
} from "@/features/proposal/api/proposalWriteApi";
import type {
  ProposalApplicationBody,
  ProposalDeclineBody,
} from "@/features/proposal/api/proposalWriteTypes";
import { useReviewMutation } from "@/features/proposal/model/useReviewMutation";
import {
  canRetryReview,
  reviewFailure,
} from "@/features/proposal/model/reviewFailure";
import { ProposalCard } from "@/features/proposal/ui/ProposalCard";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  proposalListPath,
  proposalRequestPath,
  proposalResultPath,
} from "@/routes/paths";
type Attempt = {
  mode: "apply" | "decline";
  body: ProposalApplicationBody | ProposalDeclineBody;
};
export function ProposalConfirmPage() {
  const { space } = useSpaceContext();
  const [params] = useSearchParams();
  const ids = readSelectedIds(params.get("ids"));
  const queries = useSelectedProposals(space.spaceId, ids);
  const { drafts, clear } = useProposalDrafts(space.spaceId);
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const back = useBackNavigation(withReturn(proposalListPath(space.spaceId)));
  const attempt = useRef<Attempt | null>(null);
  const proposals = queries.flatMap((q) => (q.data ? [q.data] : []));
  const entries = proposals.map((p) => ({
    proposal: p,
    draft:
      drafts[p.proposalId]?.reviewToken === p.reviewToken
        ? drafts[p.proposalId]
        : initialProposalDraft(p),
  }));
  const loaded =
    ids.length > 0 &&
    proposals.length === ids.length &&
    queries.every((q) => !q.isError);
  const problem = entries
    .map(({ proposal, draft }) => proposalDraftProblem(proposal, draft))
    .find(Boolean);
  const targets = entries
    .filter(
      (e) =>
        e.proposal.action !== "CREATE_ITEM" &&
        e.draft.targetItemId &&
        e.draft.targetVersion,
    )
    .map((e) => ({
      itemId: e.draft.targetItemId!,
      version: e.draft.targetVersion!,
    }));
  const duplicate =
    new Set(targets.map((t) => t.itemId)).size !== targets.length;
  const leases = useReviewLeases(
    space.spaceId,
    targets,
    loaded && !problem && !duplicate,
  );
  const mutation = useReviewMutation(space.spaceId, async (value: Attempt) => {
    if (value.mode === "decline") {
      await declineProposals(space.spaceId, value.body as ProposalDeclineBody);
      return { requestId: null };
    }
    const body = value.body as ProposalApplicationBody;
    if (space.role === "OWNER") {
      await applyProposals(space.spaceId, body);
      return { requestId: null };
    }
    const result = await submitProposalRequest(space.spaceId, {
      ...body,
      entries: body.entries.map((e) => ({ ...e, sourceType: "AI_PROPOSAL" })),
    });
    return { requestId: result.requestId };
  });
  const pending = mutation.isPending;
  function submit(mode: "apply" | "decline") {
    if (pending || !loaded) return;
    if (!attempt.current) {
      if (mode === "apply" && (problem || duplicate || !leases.ensureCurrent()))
        return;
      if (mode === "decline" && space.role !== "OWNER") return;
      attempt.current = {
        mode,
        body: {
          clientRequestId: crypto.randomUUID(),
          entries: entries.map(({ proposal: p, draft: d }) =>
            mode === "decline"
              ? { proposalId: p.proposalId, reviewToken: p.reviewToken! }
              : {
                  proposalId: p.proposalId,
                  action: p.action,
                  reviewToken: p.reviewToken!,
                  ...(p.action !== "CREATE_ITEM" && {
                    targetItemId: d.targetItemId!,
                    expectedItemVersion: d.targetVersion!,
                    leaseToken: leases.leases.find(
                      (l) => l.itemId === d.targetItemId,
                    )!.leaseToken,
                  }),
                  values: proposalInputValues(p, d),
                },
          ),
        },
      };
    }
    mutation.mutate(attempt.current, {
      onSuccess: (result, submitted) => {
        clear(submitted.body.entries.map((entry) => entry.proposalId));
        void navigate(
          withReturn(
            result.requestId
              ? proposalRequestPath(space.spaceId, result.requestId)
              : `${proposalResultPath(space.spaceId, ids[0])}?ids=${ids.join(",")}`,
          ),
          { replace: true },
        );
      },
    });
  }
  const blocked = !!mutation.error && !canRetryReview(mutation.error);
  return (
    <ProposalPageLayout
      title="반영 전 확인"
      spaceId={space.spaceId}
      onBack={back}
      actions={
        loaded ? (
          <>
            <Button
              loading={pending}
              disabled={
                blocked ||
                (!mutation.variables &&
                  (!!problem || duplicate || !leases.ready))
              }
              onClick={() => submit("apply")}
            >
              {mutation.error && canRetryReview(mutation.error)
                ? "같은 요청으로 다시 확인"
                : space.role === "OWNER"
                  ? "선택한 내용 반영"
                  : "소유자에게 반영 요청"}
            </Button>
            {space.role === "OWNER" && !mutation.variables && (
              <TextAction
                disabled={pending || proposals.some((p) => !p.reviewToken)}
                onClick={() => submit("decline")}
              >
                선택한 제안 반영하지 않기
              </TextAction>
            )}
            <TextAction
              onClick={back}
              disabled={pending}
            >
              검토로 돌아가기
            </TextAction>
          </>
        ) : undefined
      }
    >
      <h1 className="text-hm-title-page">
        {space.role === "OWNER"
          ? "반영 전에 한 번 더 확인해 주세요"
          : "요청할 내용을 확인해 주세요"}
      </h1>
      <Notice
        title={
          space.role === "OWNER"
            ? "확인한 내용만 돌봄에 반영해요"
            : "아직 돌봄 정보는 바뀌지 않아요"
        }
        body={
          space.role === "OWNER"
            ? "선택한 내용은 함께 처리돼요. 하나라도 바뀌면 다시 검토해야 해요."
            : "소유자가 요청을 검토하고 최종 반영해요."
        }
      />
      {!ids.length ? (
        <EmptyState
          title="선택한 제안이 없어요"
          body="목록에서 반영할 내용을 선택해 주세요."
        />
      ) : !loaded ? (
        <ReviewQueryState
          error={queries.find((q) => q.error)?.error}
          retry={() => queries.forEach((q) => void q.refetch())}
        />
      ) : (
        entries.map(({ proposal, draft }) => (
          <ProposalCard
            key={proposal.proposalId}
            proposal={proposal}
            draft={draft}
            members={members.data}
            readonly
          />
        ))
      )}
      {(problem || duplicate || leases.error || mutation.error) && (
        <Notice
          tone="error"
          title="다시 확인이 필요해요"
          body={
            mutation.error
              ? reviewFailure(mutation.error)
              : duplicate
                ? "같은 돌봄 항목의 제안은 하나씩 반영해 주세요."
                : problem || reviewFailure(leases.error)
          }
        />
      )}
      {loaded && !problem && !duplicate && !leases.ready && !leases.error && (
        <p
          role="status"
          className="text-hm-body-default"
        >
          다른 가족의 편집 여부를 확인하고 있어요.
        </p>
      )}
    </ProposalPageLayout>
  );
}
