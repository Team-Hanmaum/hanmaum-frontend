import { useRef, useState } from "react";
import { useParams } from "react-router";
import { Badge, Button, SelectionRow, TextAction } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { useChangeRequest } from "@/features/proposal/model/useChangeRequests";
import type { ChangeRequestEntry } from "@/features/proposal/api/changeRequestTypes";
import type {
  RequestApplicationBody,
  RequestDecisionBody,
  RequestCancellationBody,
} from "@/features/proposal/api/proposalWriteTypes";
import {
  applyRequestEntries,
  declineRequestEntries,
  cancelRequestEntries,
} from "@/features/proposal/api/proposalWriteApi";
import { useReviewMutation } from "@/features/proposal/model/useReviewMutation";
import {
  reviewFailure,
  canRetryReview,
} from "@/features/proposal/model/reviewFailure";
import {
  requestStatusLabels,
  actionLabels,
} from "@/features/proposal/model/reviewLabels";
import { useReviewLeases } from "@/features/careitem/model/useReviewLeases";
import { ChangeRequestValues } from "@/features/proposal/ui/ChangeRequestValues";
import {
  authorName,
  formatServerTime,
  readCareText,
} from "@/features/careitem/model/careReadView";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  proposalListPath,
  proposalEvidencePath,
  careItemPath,
  careHistoryPath,
  spaceInfoRequestPath,
} from "@/routes/paths";
type Decision = {
  mode: "apply" | "decline" | "cancel";
  entries: ChangeRequestEntry[];
};
type Attempt =
  | { mode: "apply"; body: RequestApplicationBody }
  | { mode: "decline"; body: RequestDecisionBody }
  | { mode: "cancel"; body: RequestCancellationBody };

function requestEntryTitle(entry: ChangeRequestEntry) {
  if (entry.status === "INVALIDATED" || entry.redactedFields.length)
    return "내용이 가려진 요청";
  return (
    readCareText(entry.decision?.appliedValues?.title) ??
    readCareText(entry.currentValues?.title) ??
    readCareText(entry.requestedValues?.title) ??
    actionLabels[entry.action]
  );
}

export function ProposalRequestPage() {
  const { space } = useSpaceContext();
  const { requestId = "" } = useParams();
  const query = useChangeRequest(space.spaceId, requestId);
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const back = useBackNavigation(
    withReturn(proposalListPath(space.spaceId, "requests")),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [message, setMessage] = useState("");
  const attempt = useRef<Attempt | null>(null);
  const owner = space.role === "OWNER";
  const mine =
    members.data?.find((m) => m.isMe)?.membershipId ===
    query.data?.submittedBy.membershipId;
  const entries = decision?.entries ?? [];
  const targets =
    decision?.mode === "apply"
      ? entries
          .filter((e) => e.targetItemId && e.expectedItemVersion)
          .map((e) => ({
            itemId: e.targetItemId!,
            version: e.expectedItemVersion!,
            purpose:
              e.action === "DELETE_ITEM"
                ? ("DELETION" as const)
                : ("EDIT" as const),
          }))
      : [];
  const leases = useReviewLeases(
    space.spaceId,
    targets,
    decision?.mode === "apply",
  );
  const mutation = useReviewMutation(space.spaceId, async (a: Attempt) => {
    if (a.mode === "apply") await applyRequestEntries(space.spaceId, a.body);
    else if (a.mode === "decline")
      await declineRequestEntries(space.spaceId, a.body);
    else await cancelRequestEntries(space.spaceId, requestId, a.body);
  });
  function prepare(mode: Decision["mode"]) {
    const chosen =
      query.data?.entries.filter(
        (e) =>
          e.action !== "UPDATE_SPACE" &&
          selected.includes(e.requestEntryId) &&
          e.status === "PENDING",
      ) ?? [];
    if (!chosen.length || chosen.length > 20 || mutation.isPending) return;
    if (mode !== "cancel" && (!owner || chosen.some((e) => !e.reviewToken)))
      return;
    if (mode === "cancel" && !mine) return;
    if (mode === "apply") {
      if (chosen.some((e) => e.redactedFields.length > 0)) {
        setMessage(
          "일부 내용이 가려진 요청은 반영할 수 없어요. 최신 내용을 확인하거나 반영하지 않기로 처리해 주세요.",
        );
        return;
      }
      if (
        chosen.some(
          (e) =>
            e.sourceType !== "AI_PROPOSAL" &&
            ![
              "CREATE_ITEM",
              "UPDATE_ITEM",
              "DELETE_ITEM",
              "RESOLVE_QUESTION",
            ].includes(e.action),
        )
      ) {
        setMessage(
          "아직 연결되지 않은 변경 요청이 포함되어 있어요. 다른 요청을 선택해 주세요.",
        );
        return;
      }
      if (
        chosen.some(
          (e) =>
            e.expectedItemVersion !== e.currentItemVersion ||
            e.expectedSpaceVersion !== e.currentSpaceVersion,
        )
      ) {
        setMessage(
          "요청 이후 돌봄 정보가 바뀌었어요. 오래된 요청을 그대로 반영할 수 없어요. 반영하지 않기로 처리하고 새 요청을 확인해 주세요.",
        );
        return;
      }
      const targets = chosen.flatMap((e) =>
        e.targetItemId ? [e.targetItemId] : [],
      );
      if (new Set(targets).size !== targets.length) {
        setMessage("같은 돌봄 항목의 요청은 하나씩 반영해 주세요.");
        return;
      }
    }
    attempt.current = null;
    mutation.reset();
    setMessage("");
    setDecision({ mode, entries: chosen });
  }
  function submit() {
    if (!decision || mutation.isPending) return;
    if (!attempt.current) {
      const clientRequestId = crypto.randomUUID();
      if (decision.mode === "apply") {
        if (!leases.ensureCurrent()) return;
        attempt.current = {
          mode: "apply",
          body: {
            clientRequestId,
            entries: entries.map((e) => ({
              requestEntryId: e.requestEntryId,
              reviewToken: e.reviewToken!,
              ...(e.expectedItemVersion && {
                expectedItemVersion: e.expectedItemVersion,
                leaseToken: leases.leases.find(
                  (l) => l.itemId === e.targetItemId,
                )?.leaseToken,
              }),
              ...(e.expectedSpaceVersion && {
                expectedSpaceVersion: e.expectedSpaceVersion,
              }),
            })),
          },
        };
      } else if (decision.mode === "decline")
        attempt.current = {
          mode: "decline",
          body: {
            clientRequestId,
            entries: entries.map((e) => ({
              requestEntryId: e.requestEntryId,
              reviewToken: e.reviewToken!,
            })),
          },
        };
      else
        attempt.current = {
          mode: "cancel",
          body: {
            clientRequestId,
            entries: entries.map((e) => ({ requestEntryId: e.requestEntryId })),
          },
        };
    }
    mutation.mutate(attempt.current, {
      onSuccess: () => {
        setDecision(null);
        setSelected([]);
        attempt.current = null;
        setMessage(
          decision.mode === "apply"
            ? "선택한 요청을 돌봄에 반영했어요."
            : decision.mode === "decline"
              ? "선택한 요청을 반영하지 않았어요."
              : "선택한 요청을 취소했어요.",
        );
      },
    });
  }
  const title = decision
    ? decision.mode === "apply"
      ? "요청 반영 전 확인"
      : decision.mode === "decline"
        ? "반영하지 않기 확인"
        : "요청 취소 확인"
    : "요청 상태";
  const disabled = mutation.isPending || !!query.error;
  const selectedPending = (query.data?.entries ?? []).filter(
    (e) => e.status === "PENDING" && selected.includes(e.requestEntryId),
  );
  const staleDecision =
    !!decision &&
    entries.some((e) => {
      const latest = query.data?.entries.find(
        (x) => x.requestEntryId === e.requestEntryId,
      );
      return (
        !latest ||
        latest.status !== "PENDING" ||
        latest.reviewToken !== e.reviewToken
      );
    });
  return (
    <ProposalPageLayout
      title={title}
      spaceId={space.spaceId}
      onBack={() => {
        if (decision && !mutation.isPending) {
          setDecision(null);
          mutation.reset();
          attempt.current = null;
        } else back();
      }}
      actions={
        decision ? (
          <div className="grid grid-cols-2 gap-hm-12">
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => {
                setDecision(null);
                mutation.reset();
                attempt.current = null;
              }}
            >
              돌아가기
            </Button>
            <Button
              loading={mutation.isPending}
              disabled={
                (!!mutation.error && !canRetryReview(mutation.error)) ||
                (!mutation.variables &&
                  (staleDecision ||
                    (decision.mode === "apply" && !leases.ready)))
              }
              onClick={submit}
            >
              {mutation.error && canRetryReview(mutation.error)
                ? "같은 요청으로 다시 확인"
                : decision.mode === "apply"
                  ? "요청 반영"
                  : decision.mode === "decline"
                    ? "반영하지 않기"
                    : "요청 취소"}
            </Button>
          </div>
        ) : query.data ? (
          <>
            {owner && (
              <div className="grid grid-cols-2 gap-hm-12">
                <Button
                  variant="outline"
                  disabled={disabled || !selectedPending.length}
                  onClick={() => prepare("decline")}
                >
                  반영하지 않기
                </Button>
                <Button
                  disabled={disabled || !selectedPending.length}
                  onClick={() => prepare("apply")}
                >
                  반영 전 확인
                </Button>
              </div>
            )}
            {mine && (
              <Button
                variant="secondary"
                disabled={disabled || !selectedPending.length}
                onClick={() => prepare("cancel")}
              >
                선택한 요청 취소
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      {!query.data || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <div className="flex flex-col gap-hm-4">
            <h1 className="text-hm-title-page wrap-anywhere">
              {authorName(query.data.submittedBy)}님의 요청
            </h1>
            <time
              dateTime={query.data.submittedAt}
              className="text-hm-body-small text-hm-text-secondary"
            >
              {formatServerTime(query.data.submittedAt)}
            </time>
          </div>
          {decision && (
            <p className="text-hm-body-small text-hm-text-secondary">
              {decision?.mode === "apply"
                ? "요청에 저장된 내용 그대로 반영해요. 최신 정보와 다르면 반영할 수 없어요."
                : decision?.mode === "cancel"
                  ? "다시 요청하려면 해당 항목의 입력 화면이나 제안 검토에서 새 요청을 제출해 주세요."
                  : "선택한 요청을 미반영 상태로 처리해요."}
            </p>
          )}
          {(decision?.entries ?? query.data.entries).map((e) => {
            const entryTitle = requestEntryTitle(e);
            return (
              <article
                key={e.requestEntryId}
                className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface p-hm-16"
              >
                <div className="flex flex-wrap items-center justify-between gap-hm-8">
                  {entryTitle !== actionLabels[e.action] && (
                    <span className="text-hm-caption-default text-hm-text-secondary">
                      {actionLabels[e.action]}
                    </span>
                  )}
                  <Badge
                    label={requestStatusLabels[e.status]}
                    tone={
                      e.status === "PENDING" || e.status === "APPLIED"
                        ? "brand"
                        : "neutral"
                    }
                  />
                </div>
                {!decision &&
                e.action !== "UPDATE_SPACE" &&
                e.status === "PENDING" &&
                (owner || mine) ? (
                  <SelectionRow
                    label={entryTitle}
                    className="p-hm-12"
                    checked={selected.includes(e.requestEntryId)}
                    onChange={(event) =>
                      setSelected((old) =>
                        event.target.checked
                          ? [...new Set([...old, e.requestEntryId])].slice(
                              0,
                              20,
                            )
                          : old.filter((id) => id !== e.requestEntryId),
                      )
                    }
                  />
                ) : (
                  <h2 className="text-hm-heading-section">{entryTitle}</h2>
                )}
                <ChangeRequestValues
                  entry={e}
                  members={members.data}
                  title={entryTitle}
                />
                {e.targetItemId && (
                  <TextAction
                    className="self-start text-hm-text-brand"
                    onClick={() =>
                      void navigate(
                        withReturn(
                          careItemPath(space.spaceId, e.targetItemId!),
                        ),
                      )
                    }
                  >
                    대상 돌봄 항목 보기
                  </TextAction>
                )}
                {e.action === "UPDATE_SPACE" && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void navigate(
                        withReturn(
                          spaceInfoRequestPath(space.spaceId, requestId),
                        ),
                      )
                    }
                  >
                    공간 정보 요청 확인
                  </Button>
                )}
                {e.proposalId &&
                  e.status !== "INVALIDATED" &&
                  !e.redactedFields.length && (
                    <TextAction
                      onClick={() =>
                        void navigate(
                          withReturn(
                            proposalEvidencePath(space.spaceId, e.proposalId!),
                          ),
                        )
                      }
                    >
                      제안 근거 보기
                    </TextAction>
                  )}
                {e.decision?.itemId && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void navigate(
                          withReturn(
                            careItemPath(space.spaceId, e.decision!.itemId!),
                          ),
                        )
                      }
                    >
                      돌봄에서 결과 확인
                    </Button>
                    {e.decision.itemVersion && (
                      <TextAction
                        onClick={() =>
                          void navigate(
                            withReturn(
                              careHistoryPath(
                                space.spaceId,
                                e.decision!.itemId!,
                                e.decision!.itemVersion!,
                              ),
                            ),
                          )
                        }
                      >
                        이 변경 이력 보기
                      </TextAction>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </>
      )}
      {message && (
        <Notice
          title="요청 처리 안내"
          body={message}
        />
      )}
      {(mutation.error || leases.error || staleDecision) && (
        <Notice
          tone="error"
          title="처리를 확인해 주세요"
          body={
            mutation.error
              ? reviewFailure(mutation.error)
              : leases.error
                ? reviewFailure(leases.error)
                : "요청 상태가 바뀌었어요. 목록에서 다시 확인해 주세요."
          }
        />
      )}
    </ProposalPageLayout>
  );
}
