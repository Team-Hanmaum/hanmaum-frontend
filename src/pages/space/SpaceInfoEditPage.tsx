import { useRef, useState } from "react";
import { useBlocker, useNavigate, useOutletContext } from "react-router";
import { Button, Field, TextAction } from "@/components/ui";
import { ConfirmDialog, Notice } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import {
  mockSpaceInfoChanges,
  validateSubjectLabel,
} from "@/features/carespace/model/mockSpaceInfoChanges";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { SpaceInfoComparison } from "@/features/carespace/ui/SpaceInfoComparison";
import { useMockAction } from "@/lib/useMockAction";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { spaceInfoPath, spaceInfoRequestPath } from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
const states = [
  { value: "default", label: "기본" },
  { value: "error", label: "처리 실패" },
  { value: "stale", label: "정보 변경·재비교" },
  { value: "role", label: "역할 변경" },
  { value: "locked", label: "변경 잠금 예시" },
  { value: "unknown", label: "결과 미확인" },
] as const;
export function SpaceInfoEditPage() {
  const space = useOutletContext<CareSpaceView>();
  const navigate = useNavigate();
  const [value, setValue] = useState(space.subjectLabel);
  const [baseline, setBaseline] = useState({
    version: space.infoVersion ?? 0,
    role: space.role,
  });
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [resultId, setResultId] = useState("");
  const committed = useRef(false);
  const { pending, run } = useMockAction();
  const [state, setState] = useMockScreenState(states, "default");
  const dirty = value.trim() !== space.subjectLabel;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !committed.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  const changed =
    baseline.version !== (space.infoVersion ?? 0) ||
    baseline.role !== space.role ||
    state === "stale" ||
    state === "role";
  const owner = baseline.role === "owner";
  const back = () => {
    if (pending || resultId) return;
    if (confirm) setConfirm(false);
    else void navigate(spaceInfoPath(space.id));
  };
  function submit() {
    setError("");
    const invalid = validateSubjectLabel(value);
    if (invalid) {
      setError(invalid);
      setConfirm(false);
      return;
    }
    if (changed) {
      setBaseline({ version: space.infoVersion ?? 0, role: space.role });
      setState("default");
      setConfirm(true);
      return;
    }
    if (!confirm) {
      setConfirm(true);
      return;
    }
    run(() => {
      if (state === "error") {
        setError("변경을 보내지 못했어요. 입력한 내용은 그대로예요.");
        setState("default");
        return;
      }
      try {
        const result = mockSpaceInfoChanges.submit(
          space.id,
          value,
          baseline.version,
          baseline.role,
        );
        committed.current = true;
        if (state === "unknown") setResultId(result.id);
        else
          void navigate(spaceInfoRequestPath(space.id, result.id), {
            replace: true,
          });
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "처리를 완료하지 못했어요. 다시 확인해 주세요.",
        );
      }
    });
  }
  return (
    <AccountPageLayout
      title={
        resultId
          ? "처리 상태 확인"
          : confirm
            ? owner
              ? "공간 정보 변경 확인"
              : "수정 요청 확인"
            : "공간 정보 수정"
      }
      onBack={back}
      preview={{
        value: state,
        options: states,
        onChange: (next) => {
          if (!pending && !resultId) {
            setState(next);
            setError("");
          }
        },
      }}
      actions={
        resultId ? (
          <Button
            onClick={() =>
              void navigate(spaceInfoRequestPath(space.id, resultId), {
                replace: true,
              })
            }
          >
            처리 상태 확인
          </Button>
        ) : (
          <>
            <Button
              loading={pending}
              disabled={!dirty || state === "locked"}
              onClick={submit}
            >
              {changed
                ? "변경 내용 다시 확인"
                : !confirm
                  ? "변경 내용 확인"
                  : owner
                    ? "변경 내용 반영"
                    : "수정 요청 보내기"}
            </Button>
            <TextAction
              disabled={pending}
              onClick={back}
            >
              {confirm ? "다시 수정하기" : "수정 취소"}
            </TextAction>
          </>
        )
      }
    >
      {resultId ? (
        <>
          <h1 className="text-hm-title-page">
            처리 결과를
            <br />
            확인하지 못했어요
          </h1>
          <Notice
            title="같은 내용을 다시 보내지 않아요"
            body="처리 상태를 확인한 뒤 결과를 안내할게요."
          />
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {confirm ? (
              owner ? (
                "이 이름으로 변경할까요?"
              ) : (
                "소유자에게 수정을 요청할까요?"
              )
            ) : (
              <>
                부모님을
                <br />
                어떻게 표시할까요?
              </>
            )}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            현재 공간의 이름·호칭을 수정해요.
          </p>
          {confirm ? (
            <SpaceInfoComparison
              before={space.subjectLabel}
              after={value.trim()}
            />
          ) : (
            <>
              <Field
                label="부모님 이름 또는 호칭"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError("");
                }}
                helper={`현재: ${space.subjectLabel}`}
                error={error || undefined}
                disabled={pending}
              />
              <FamilyInfoCard title="이렇게 표시돼요">
                {value.trim() || "이름 또는 호칭"}의 돌봄
              </FamilyInfoCard>
            </>
          )}
          <Notice
            title={
              owner
                ? "가족에게 보이는 이름이 바뀌어요"
                : "현재 공간 정보는 그대로예요"
            }
            body={
              owner
                ? "소식과 돌봄 기록은 그대로예요."
                : "소유자가 요청 내용을 확인한 뒤 최종 반영해요."
            }
          />
          {changed && (
            <Notice
              title="현재 정보와 다시 비교해 주세요"
              body="입력한 내용은 유지돼요. 현재 이름과 내 역할을 확인한 뒤 진행해 주세요."
            />
          )}
          {state === "locked" && (
            <Notice
              title="지금은 변경할 수 없어요"
              body="잠금 상태의 UI 예시예요. 실제 잠금 조건과 해제 정책은 미정이에요."
            />
          )}
          {confirm && error && (
            <Notice
              tone="error"
              role="alert"
              title="처리하지 못했어요"
              body={error}
            />
          )}
        </>
      )}
      <ConfirmDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") blocker.reset();
        }}
        title="수정을 취소할까요?"
        body="입력한 내용은 저장되지 않아요. 현재 공간 정보는 그대로예요."
        confirmLabel="수정 취소"
        cancelLabel="계속 수정"
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
      />
    </AccountPageLayout>
  );
}
