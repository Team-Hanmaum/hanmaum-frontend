import { useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { CareChangeSummary } from "@/features/careitem/ui/CareChangeSummary";
import { mockCareChanges } from "@/features/careitem/model/mockCareChanges";
import {
  careChangeTitle,
  careDraftError,
} from "@/features/careitem/model/careChangeRules";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { useMockAction } from "@/lib/useMockAction";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careItemPath,
  careListPath,
  careRequestsPath,
  careHistoryPath,
} from "@/routes/paths";

export function CareChangeDetailPage() {
  const space = useOutletContext<CareSpaceView>();
  const { changeId } = useParams();
  const [params, setParams] = useSearchParams();
  const data = useMockProposals(space);
  const change = data.careChanges?.find((entry) => entry.id === changeId);
  const [ownerPreview, setOwnerPreview] = useState(false);
  const [error, setError] = useState("");
  const { pending, run } = useMockAction();
  const navigate = useNavigate();
  const actorSpace: CareSpaceView = ownerPreview
    ? {
        ...space,
        role: "owner",
        members: space.members.map((member) => ({
          ...member,
          self: member.role === "owner",
        })),
      }
    : space;
  const item = data.items.find((entry) => entry.id === change?.draft.itemId);
  const self = space.members.find((member) => member.self);
  const visible =
    change &&
    (space.role === "owner" ||
      change.author.id === self?.id ||
      change.status === "applied");
  const waiting = change?.status === "requested";
  const canDecide = waiting && actorSpace.role === "owner";
  const invalid =
    change && waiting
      ? change.redacted
        ? "원본 삭제로 요청 내용을 표시하거나 반영할 수 없어요."
        : careDraftError(change.draft, item, actorSpace)
      : undefined;
  function decide(decision: "applied" | "rejected") {
    if (!change) return;
    setError("");
    run(() => {
      const result = mockCareChanges.decide(actorSpace, change.id, decision);
      if (!result.ok) setError(result.message);
    });
  }
  if (visible && params.get("pendingResult") === "1")
    return (
      <ProposalPageLayout
        title="처리 결과 확인"
        spaceId={space.id}
        onBack={() => void navigate(careRequestsPath(space.id))}
        actions={
          <Button
            onClick={() =>
              void setParams(
                (previous) => {
                  const next = new URLSearchParams(previous);
                  next.delete("pendingResult");
                  return next;
                },
                { replace: true },
              )
            }
          >
            처리 결과 확인
          </Button>
        }
      >
        <Notice
          title="처리 결과를 확인하고 있어요"
          body="다시 제출하지 말고 기존 처리 결과를 확인해 주세요. Mock에서 저장한 결과를 조회해요."
        />
      </ProposalPageLayout>
    );
  return (
    <ProposalPageLayout
      title={canDecide ? "요청 검토" : waiting ? "요청 상태" : "처리 결과"}
      spaceId={space.id}
      onBack={() => void navigate(careRequestsPath(space.id))}
      tabs
      activeTab="care"
      actions={
        visible &&
        (canDecide ? (
          <>
            <Button
              disabled={Boolean(invalid)}
              loading={pending}
              onClick={() => decide("applied")}
            >
              요청 반영
            </Button>
            <TextAction
              disabled={pending}
              onClick={() => decide("rejected")}
            >
              미적용으로 처리
            </TextAction>
          </>
        ) : (
          <Button
            onClick={() =>
              void navigate(
                item && !item.deletedAt
                  ? careItemPath(space.id, item.id)
                  : careListPath(space.id, { type: change.draft.kind }),
              )
            }
          >
            {item && !item.deletedAt ? "현재 항목 보기" : "돌봄 목록으로"}
          </Button>
        ))
      }
    >
      {!visible ? (
        <EmptyState
          title="요청을 확인할 수 없어요"
          body="현재 공간의 요청을 다시 선택해 주세요. 새로고침하면 Mock에서 작성한 요청은 초기화돼요."
          action={{
            label: "요청 목록으로",
            onClick: () => void navigate(careRequestsPath(space.id)),
          }}
        />
      ) : (
        <>
          <Badge
            className="self-start"
            label={
              waiting
                ? "승인 대기"
                : change.status === "applied"
                  ? "반영 완료"
                  : "미적용"
            }
            tone={change.status === "applied" ? "brand" : "neutral"}
          />
          <h1 className="text-hm-title-page">
            {careChangeTitle(change.draft)}
            {waiting
              ? " 요청"
              : change.status === "applied"
                ? "을 반영했어요"
                : "은 반영하지 않았어요"}
          </h1>
          <p className="text-hm-body-small text-hm-text-secondary">
            {change.author.name} · {formatRecordDate(change.createdAt)}
          </p>
          {ownerPreview && (
            <Notice
              title="Mock · 소유자 검토 화면"
              body="같은 예시 요청의 승인 흐름을 확인하고 있어요. 실제 역할이나 계정 권한은 변경되지 않아요."
            />
          )}
          {(error || invalid) && (
            <Notice
              role="alert"
              tone="error"
              title="현재 내용을 확인해 주세요"
              body={error || invalid!}
            />
          )}
          {change.redacted ? (
            <Notice
              title="원본이 삭제됐어요"
              body="복사된 요청 내용과 이전 정보는 다시 표시하지 않아요."
            />
          ) : (
            <CareChangeSummary
              draft={change.draft}
              before={change.before}
              space={space}
            />
          )}
          {waiting && (
            <Notice
              title="현재 돌봄 정보는 그대로예요"
              body="소유자가 요청과 최신 내용을 확인한 뒤 반영해요. 요청을 보낸 것만으로 현재 값이 바뀌지 않아요."
            />
          )}
          {change.decidedBy && (
            <p className="text-hm-body-small">
              {change.decidedBy.name} · {formatRecordDate(change.decidedAt!)}{" "}
              처리
            </p>
          )}
          {waiting && space.role === "member" && !ownerPreview && (
            <TextAction onClick={() => setOwnerPreview(true)}>
              Mock · 소유자로 검토해 보기
            </TextAction>
          )}
          {item && change.status === "applied" && (
            <MenuRow
              icon="clock-brand"
              title="변경 이력 보기"
              onClick={() => void navigate(careHistoryPath(space.id, item.id))}
            />
          )}
          <MenuRow
            icon="news-brand"
            title={space.role === "owner" ? "확인할 요청" : "내 요청 상태"}
            onClick={() => void navigate(careRequestsPath(space.id))}
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
