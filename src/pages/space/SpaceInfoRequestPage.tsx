import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import { ErrorState, Notice } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import {
  mockSpaceInfoChanges,
  useMockSpaceInfoChanges,
  type SpaceInfoChangeFailure,
} from "@/features/carespace/model/mockSpaceInfoChanges";
import { SpaceInfoComparison } from "@/features/carespace/ui/SpaceInfoComparison";
import { useMockAction } from "@/lib/useMockAction";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { spaceInfoPath, spaceInfoRequestsPath } from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
const states = [
  { value: "default", label: "기본" },
  { value: "error", label: "처리 실패" },
  { value: "stale", label: "정보 변경" },
  { value: "forbidden", label: "권한 변경" },
  { value: "unknown", label: "결과 미확인" },
] as const;
export function SpaceInfoRequestPage() {
  const space = useOutletContext<CareSpaceView>();
  const { requestId } = useParams();
  const changes = useMockSpaceInfoChanges(space.id);
  const change = changes.find((entry) => entry.id === requestId);
  const navigate = useNavigate();
  const [decision, setDecision] = useState<"apply" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [failure, setFailure] = useState<SpaceInfoChangeFailure | null>(null);
  const [unknown, setUnknown] = useState(false);
  const [ownerPreview, setOwnerPreview] = useState(false);
  const [state, setState] = useMockScreenState(states, "default");
  const { pending, run } = useMockAction();
  const self = space.members.find((member) => member.self);
  const visible =
    change && (space.role === "owner" || change.authorId === self?.id);
  const toList = () => void navigate(spaceInfoRequestsPath(space.id));
  const toInfo = () => void navigate(spaceInfoPath(space.id));
  const owner =
    (space.role === "owner" || ownerPreview) &&
    state !== "forbidden" &&
    failure?.reason !== "permission";
  const stale =
    change?.version !== (space.infoVersion ?? 0) ||
    state === "stale" ||
    failure?.reason === "stale";
  function submit() {
    if (!change || !decision) return;
    setError("");
    setFailure(null);
    run(() => {
      if (state === "error") {
        setError("처리하지 못했어요. 다시 확인한 뒤 시도해 주세요.");
        setState("default");
        return;
      }
      try {
        const result = mockSpaceInfoChanges.decide(
          change.id,
          decision === "apply",
          change.version,
          ownerPreview,
        );
        setDecision(null);
        if (!result.ok) {
          setFailure(result);
          if (result.reason === "processed") setUnknown(true);
          return;
        }
        if (state === "unknown") setUnknown(true);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "처리하지 못했어요.");
      }
    });
  }
  return (
    <AccountPageLayout
      title="공간 정보 요청"
      onBack={() => {
        if (!pending) {
          if (decision) setDecision(null);
          else toList();
        }
      }}
      spaceId={decision || unknown ? undefined : space.id}
      preview={{
        value: state,
        options: states,
        onChange: (value) => {
          if (!pending && !unknown) {
            setState(value);
            setDecision(null);
            setError("");
            setFailure(null);
          }
        },
      }}
      actions={
        visible &&
        failure?.reason !== "missing" &&
        (unknown ? (
          <Button
            onClick={() => {
              setUnknown(false);
              setState("default");
              setFailure(null);
            }}
          >
            처리 상태 확인
          </Button>
        ) : change.status !== "requested" || stale ? (
          <>
            <Button onClick={toInfo}>현재 공간 정보 보기</Button>
            <TextAction onClick={toList}>요청 목록으로</TextAction>
          </>
        ) : owner ? (
          <>
            {decision ? (
              <Button
                loading={pending}
                variant={decision === "reject" ? "destructive" : "primary"}
                onClick={submit}
              >
                {decision === "apply" ? "변경 내용 반영" : "미적용으로 처리"}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setDecision("apply");
                }}
              >
                반영 내용 확인
              </Button>
            )}
            <TextAction
              disabled={pending}
              onClick={() => {
                if (decision) setDecision(null);
                else setDecision("reject");
              }}
            >
              {decision ? "요청 내용으로" : "미적용으로 처리"}
            </TextAction>
          </>
        ) : failure?.reason === "permission" ? (
          <>
            <Button onClick={toInfo}>현재 공간·역할 확인</Button>
            <TextAction onClick={toList}>요청 목록으로</TextAction>
          </>
        ) : (
          <>
            <Button onClick={toList}>내 요청 목록으로</Button>
            <TextAction onClick={toInfo}>공간 정보 보기</TextAction>
          </>
        ))
      }
    >
      {!visible || failure?.reason === "missing" ? (
        <ErrorState
          reason="no-permission"
          title="요청을 확인할 수 없어요"
          actionLabel="목록으로"
          onAction={toList}
        />
      ) : unknown ? (
        <>
          <h1 className="text-hm-title-page">
            {failure?.reason === "processed"
              ? "이미 처리된 요청이에요"
              : "처리 결과를 확인하지 못했어요"}
          </h1>
          <Notice
            title="중복으로 처리하지 않아요"
            body="상태를 확인한 뒤 결과를 안내할게요."
          />
        </>
      ) : (
        <>
          {ownerPreview && (
            <Notice
              title="Mock · 소유자 검토 예시"
              body="실제 내 역할은 바뀌지 않아요. 같은 Mock 요청을 소유자가 처리하는 화면을 확인해요."
            />
          )}
          {change.status === "requested" &&
            space.role === "member" &&
            !ownerPreview && (
              <TextAction onClick={() => setOwnerPreview(true)}>
                Mock · 소유자로 검토해 보기
              </TextAction>
            )}
          <Badge
            className="self-start"
            tone="brand"
            label={
              change.status === "applied"
                ? "반영 완료"
                : change.status === "rejected"
                  ? "미적용"
                  : "승인 요청"
            }
          />
          <h1 className="text-hm-title-page">
            {change.status === "applied"
              ? "공간 정보를 변경했어요"
              : change.status === "rejected"
                ? "현재 정보를 유지했어요"
                : decision === "apply"
                  ? "이 이름으로 반영할까요?"
                  : decision === "reject"
                    ? "미적용으로 처리할까요?"
                    : owner
                      ? "가족이 수정을 요청했어요"
                      : "소유자의 확인을 기다리고 있어요"}
          </h1>
          <p className="text-hm-body-small text-hm-text-secondary">
            {change.author} ·{" "}
            {new Date(change.createdAt).toLocaleString("ko-KR")}
          </p>
          <SpaceInfoComparison
            before={change.before}
            after={change.after}
            beforeLabel="변경 요청 당시"
          />
          <MenuRow
            icon="care-brand"
            title="현재 공간 정보 보기"
            description={`${space.subjectLabel}의 돌봄`}
            onClick={toInfo}
          />
          <Notice
            title={
              change.status === "applied"
                ? "가족에게 같은 이름으로 보여요"
                : "현재 정보는 그대로예요"
            }
            body={
              change.status === "requested"
                ? stale
                  ? "이 요청으로 현재 정보를 변경하지 않아요."
                  : `${space.members.find((member) => member.role === "owner")?.name ?? "소유자"}님이 최종 반영하기 전에는 바뀌지 않아요.`
                : "소식과 돌봄 기록은 그대로 유지돼요."
            }
          />
          {stale && change.status === "requested" && (
            <Notice
              title="공간 정보가 바뀌었어요"
              body="요청 이후 정보가 바뀌어 이 요청은 처리할 수 없어요. 현재 공간 정보를 확인해 주세요."
            />
          )}
          {state === "forbidden" && (
            <Notice
              title="현재 소유자만 처리할 수 있어요"
              body="내 역할을 다시 확인해 주세요."
            />
          )}
          {(error || failure) && (
            <Notice
              tone="error"
              role="alert"
              title="처리하지 못했어요"
              body={failure?.message ?? error}
            />
          )}
        </>
      )}
    </AccountPageLayout>
  );
}
