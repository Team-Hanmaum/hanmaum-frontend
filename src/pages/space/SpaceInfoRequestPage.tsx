import { useState } from "react";
import { useParams } from "react-router";
import {
  Badge,
  Button,
  Comparison,
  MenuRow,
  TextAction,
} from "@/components/ui";
import { ErrorState, Notice } from "@/components/feedback";
import { ApiError } from "@/lib/api";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { useSpaceDetail } from "@/features/carespace/model/useSpaceDetail";
import { useSpaceInfoDecision } from "@/features/carespace/model/useSpaceInfoDecision";
import {
  spaceInfoDecisionError,
  spaceInfoRequestAttempt,
  type SpaceInfoDecisionMode,
} from "@/features/carespace/model/spaceInfoRequestDecision";
import { spaceInfoFailure } from "@/features/carespace/model/spaceInfoFailure";
import type { ChangeRequestEntry } from "@/features/proposal/api/changeRequestTypes";
import { useChangeRequest } from "@/features/proposal/model/useChangeRequests";
import { requestStatusLabels } from "@/features/proposal/model/reviewLabels";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import {
  authorName,
  formatServerTime,
} from "@/features/careitem/model/careReadView";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { spaceInfoPath, spaceInfoRequestsPath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

type Decision = { mode: SpaceInfoDecisionMode; entry: ChangeRequestEntry };
const resultMessages = {
  apply: "공간 정보 변경 요청을 반영했어요",
  decline: "요청을 미적용으로 처리했어요",
  cancel: "수정 요청을 취소했어요",
};
const statusTitles = {
  PENDING: "돌봄 대상 호칭 수정 요청",
  APPLIED: "공간 정보 변경 요청을 반영했어요",
  DECLINED: "요청을 미적용으로 처리했어요",
  CANCELED: "수정 요청을 취소했어요",
  INVALIDATED: "이 요청은 더 이상 처리할 수 없어요",
};

export function SpaceInfoRequestPage() {
  const { requestId = "" } = useParams();
  return (
    <RequestDetail
      key={requestId}
      requestId={requestId}
    />
  );
}

function RequestDetail({ requestId }: { requestId: string }) {
  const { space } = useSpaceContext();
  const query = useChangeRequest(space.spaceId, requestId);
  const detail = useSpaceDetail(space.spaceId);
  const action = useSpaceInfoDecision(space.spaceId, requestId);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const toList = () =>
    void navigate(withReturn(spaceInfoRequestsPath(space.spaceId)), {
      motion: "back",
    });
  const toInfo = () => void navigate(withReturn(spaceInfoPath(space.spaceId)));
  const latest = query.data?.entries.find(
    (entry) => entry.action === "UPDATE_SPACE",
  );
  const entry = decision?.entry ?? latest;
  const owner = space.role === "OWNER";
  const mine = query.data?.submittedBy.membershipId === space.membershipId;
  const denied =
    query.error instanceof ApiError &&
    [403, 404].includes(query.error.status ?? 0);
  const readable = !!query.data && !denied && (owner || mine);
  const unavailable = !!query.error || !!detail.error;
  const completed = action.result;
  const applyError =
    owner && latest && query.data
      ? spaceInfoDecisionError("apply", latest, query.data, space)
      : null;
  const staleDecision =
    !!decision &&
    (!latest ||
      latest.status !== "PENDING" ||
      latest.reviewToken !== decision.entry.reviewToken ||
      latest.currentSpaceVersion !== decision.entry.currentSpaceVersion ||
      !!(
        query.data &&
        spaceInfoDecisionError(decision.mode, latest, query.data, space)
      ));

  function prepare(mode: SpaceInfoDecisionMode) {
    if (
      !latest ||
      !query.data ||
      action.pending ||
      action.uncertain ||
      unavailable ||
      completed
    )
      return;
    const error = spaceInfoDecisionError(mode, latest, query.data, space);
    if (error) {
      setMessage(error);
      return;
    }
    action.reset();
    setMessage("");
    setDecision({ mode, entry: latest });
  }
  function submit() {
    if (action.uncertain) {
      action.retry();
      return;
    }
    if (
      !decision ||
      staleDecision ||
      unavailable ||
      action.pending ||
      action.error ||
      completed
    )
      return;
    try {
      action.submit(spaceInfoRequestAttempt(decision.mode, decision.entry));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "요청을 준비하지 못했어요.",
      );
    }
  }
  function refresh() {
    if (action.pending || action.uncertain) return;
    action.reset();
    setDecision(null);
    setMessage("");
    void Promise.all([query.refetch(), detail.refetch()]);
  }
  const status =
    completed === "apply"
      ? "APPLIED"
      : completed === "decline"
        ? "DECLINED"
        : completed === "cancel"
          ? "CANCELED"
          : entry?.status;
  const hiddenValues =
    !!entry?.redactedFields.length || !!latest?.redactedFields.length;
  const requestedName =
    !hiddenValues && typeof entry?.requestedValues?.subjectLabel === "string"
      ? entry.requestedValues.subjectLabel
      : "내용 확인 불가";
  const appliedName =
    !hiddenValues &&
    typeof latest?.decision?.appliedValues?.subjectLabel === "string"
      ? latest.decision.appliedValues.subjectLabel
      : completed === "apply"
        ? requestedName
        : null;
  const title = completed
    ? resultMessages[completed]
    : decision?.mode === "apply"
      ? "이 이름으로 반영할까요?"
      : decision?.mode === "decline"
        ? "미적용으로 처리할까요?"
        : decision?.mode === "cancel"
          ? "수정 요청을 취소할까요?"
          : status
            ? statusTitles[status]
            : "공간 정보 요청";
  return (
    <AccountPageLayout
      title="공간 정보 요청"
      onBack={() => {
        if (action.pending) return;
        if (decision && !action.uncertain && !completed) {
          setDecision(null);
          action.reset();
          setMessage("");
        } else toList();
      }}
      spaceId={decision && !completed ? undefined : space.spaceId}
      actions={
        readable &&
        entry &&
        (completed || entry.status !== "PENDING" ? (
          <>
            <Button onClick={toInfo}>현재 공간 정보 보기</Button>
            <TextAction onClick={toList}>요청 목록으로</TextAction>
          </>
        ) : decision ? (
          <>
            <Button
              loading={action.pending}
              disabled={
                !action.uncertain &&
                (unavailable || staleDecision || !!action.error)
              }
              variant={
                decision.mode === "decline" || decision.mode === "cancel"
                  ? "destructive"
                  : "primary"
              }
              onClick={submit}
            >
              {action.uncertain
                ? "같은 요청으로 다시 확인"
                : decision.mode === "apply"
                  ? "변경 내용 반영"
                  : decision.mode === "decline"
                    ? "미적용으로 처리"
                    : "요청 취소"}
            </Button>
            {action.uncertain ? (
              <TextAction
                disabled={action.pending}
                onClick={toList}
              >
                요청 목록에서 결과 확인
              </TextAction>
            ) : (
              <TextAction
                disabled={action.pending}
                onClick={refresh}
              >
                {action.error || staleDecision || unavailable
                  ? "최신 내용 다시 확인"
                  : "요청 내용으로"}
              </TextAction>
            )}
          </>
        ) : (
          <>
            {owner && (
              <>
                <Button
                  disabled={unavailable || !!applyError}
                  onClick={() => prepare("apply")}
                >
                  반영 내용 확인
                </Button>
                <TextAction
                  disabled={unavailable || !entry.reviewToken}
                  onClick={() => prepare("decline")}
                >
                  미적용으로 처리
                </TextAction>
              </>
            )}
            {mine && (
              <Button
                variant="secondary"
                disabled={unavailable}
                onClick={() => prepare("cancel")}
              >
                내 요청 취소
              </Button>
            )}
            {!owner && !mine && <Button onClick={toList}>요청 목록으로</Button>}
          </>
        ))
      }
    >
      {!query.data || denied ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : !readable || !entry ? (
        <ErrorState
          reason="no-permission"
          title="공간 정보 요청을 확인할 수 없어요"
          actionLabel="요청 목록으로"
          onAction={toList}
        />
      ) : (
        <>
          <Badge
            className="self-start"
            tone="brand"
            label={status ? requestStatusLabels[status] : "승인 요청"}
          />
          <h1 className="text-hm-title-page">{title}</h1>
          <p className="text-hm-body-small text-hm-text-secondary">
            {authorName(query.data.submittedBy)} ·{" "}
            {formatServerTime(query.data.submittedAt)}
          </p>
          <FamilyInfoCard title="부모님 이름 또는 호칭">
            <Comparison
              beforeLabel="현재 공간 이름"
              beforeValue={space.subjectLabel}
              afterLabel="요청한 이름"
              afterValue={requestedName}
            />
          </FamilyInfoCard>
          {appliedName && status === "APPLIED" ? (
            <FamilyInfoCard title="이 요청으로 반영한 이름">
              {appliedName}의 돌봄
            </FamilyInfoCard>
          ) : status === "PENDING" && !hiddenValues ? (
            <FamilyInfoCard title="요청 반영 시 공간 이름">
              {requestedName}의 돌봄
            </FamilyInfoCard>
          ) : null}
          <MenuRow
            icon="care-brand"
            title="현재 공간 정보 보기"
            description={`${space.subjectLabel}의 돌봄`}
            onClick={() => {
              if (!action.pending) toInfo();
            }}
          />
          <Notice
            title={
              status === "PENDING"
                ? "아직 현재 정보는 그대로예요"
                : "요청 처리 결과예요"
            }
            body={
              status === "PENDING"
                ? "소유자가 최종 반영하기 전에는 이름이 바뀌지 않아요. 소식과 돌봄 기록은 그대로 유지돼요."
                : status === "INVALIDATED"
                  ? "요청 이후 정보나 참여 상태가 바뀌었어요. 현재 공간 정보를 확인한 뒤 필요한 경우 새 요청을 작성해 주세요."
                  : "이 요청의 처리 결과와 현재 공간 이름은 다를 수 있어요. 현재 정보는 공간 정보 화면에서 확인해 주세요."
            }
          />
          {latest?.decision && (
            <p className="text-hm-body-small text-hm-text-secondary">
              처리 시각 · {formatServerTime(latest.decision.decidedAt)}
            </p>
          )}
          {!completed &&
            status === "PENDING" &&
            (applyError || staleDecision) && (
              <Notice
                tone="error"
                title="현재 정보와 다시 비교해 주세요"
                body={
                  applyError ??
                  "확인하는 동안 요청 상태가 바뀌었어요. 최신 내용을 다시 확인해 주세요."
                }
              />
            )}
          {unavailable && (
            <Notice
              tone="error"
              title="최신 내용을 확인하지 못했어요"
              body="표시된 내용은 유지하지만, 최신 정보를 확인하기 전에는 처리할 수 없어요."
              action={{
                label: "다시 확인",
                onClick: () => {
                  void Promise.all([query.refetch(), detail.refetch()]);
                },
                disabled: action.pending,
              }}
            />
          )}
          {(message || action.error) && (
            <Notice
              tone="error"
              role="alert"
              title={
                action.uncertain
                  ? "처리 결과를 확인하지 못했어요"
                  : "처리 내용을 확인해 주세요"
              }
              body={action.error ? spaceInfoFailure(action.error) : message}
            />
          )}
        </>
      )}
    </AccountPageLayout>
  );
}
