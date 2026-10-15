import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import { BottomSheet, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockAction } from "@/lib/useMockAction";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { useTimeSelectionScreen } from "@/routes/useTimeSelectionScreen";
import { TimeSelectionPage } from "@/pages/time-selection/TimeSelectionPage";
import {
  careItemPath,
  careListPath,
  careChangePath,
  newsDetailPath,
} from "@/routes/paths";
import {
  careKindLabels,
  type CareItemKind,
  type CareItemView,
} from "../model/careItemViewTypes";
import type { CareChangeOperation } from "../model/careChangeTypes";
import {
  makeCareDraft,
  careDraftError,
  canApplyCareChange,
  careChangeTitle,
  careStatusChoices,
} from "../model/careChangeRules";
import { mockCareChanges } from "../model/mockCareChanges";
import { CareChangeInputs } from "./CareChangeInputs";
import { CareChangeSummary } from "./CareChangeSummary";
import { CareEvidenceList } from "./CareEvidenceList";

const states = [
  { value: "default", label: "기본" },
  { value: "error", label: "저장 실패" },
  { value: "changed", label: "현재 정보 변경" },
  { value: "locked", label: "다른 가족 편집 중" },
  { value: "permission", label: "참여 권한 없음" },
  { value: "unknown", label: "처리 결과 미확인" },
] as const;
export function CareChangeForm({
  kind,
  operation,
  item,
  space,
}: {
  kind: CareItemKind;
  operation: CareChangeOperation;
  item?: CareItemView;
  space: CareSpaceView;
}) {
  const [params] = useSearchParams();
  const [initial] = useState(() => {
    const value = makeCareDraft(kind, operation, item);
    if (operation === "status" && item)
      value.nextStatus = careStatusChoices(item).find(
        (status) => status === params.get("next"),
      );
    return value;
  });
  const [draft, setDraft] = useState(initial);
  const [review, setReview] = useState(operation === "delete");
  const [error, setError] = useState("");
  const [sources, setSources] = useState(false);
  const [state, setState] = useMockScreenState(states, "default");
  const { pending, run } = useMockAction();
  const navigate = useNavigate();
  const records = useMockRecords(space);
  const { blocker, allowNavigation } = useUnsavedChanges(
    JSON.stringify(draft) !== JSON.stringify(initial),
  );
  const timeScreen = useTimeSelectionScreen(kind === "schedule" && !review);
  const back = () =>
    void navigate(
      item
        ? careItemPath(space.id, item.id)
        : careListPath(space.id, { type: kind }),
    );
  const direct = canApplyCareChange(space, draft, item);
  const label = careKindLabels[kind];
  const heading =
    operation === "create"
      ? kind === "schedule"
        ? "어떤 일정인가요?"
        : kind === "task"
          ? "무엇을 챙겨야 하나요?"
          : "무엇을 확인해야 하나요?"
      : operation === "assignee"
        ? "누가 챙길까요?"
        : operation === "status"
          ? `${label} 상태를 어떻게 바꿀까요?`
          : operation === "answer"
            ? "확인한 내용을 알려주세요"
            : "무엇이 달라졌나요?";
  const blocked = state === "locked" || state === "permission";
  function confirm() {
    const message = careDraftError(draft, item, space);
    setError(message ?? "");
    if (!message) {
      setReview(true);
      window.scrollTo(0, 0);
    }
  }
  function submit() {
    setError("");
    run(() => {
      if (state === "error" || state === "changed") {
        setError(
          state === "error"
            ? "저장하지 못했어요. 입력은 유지돼요. 다시 시도해 주세요."
            : "현재 정보가 달라졌어요. 내용을 다시 확인해 주세요.",
        );
        return;
      }
      const result = mockCareChanges.submit(space, draft);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      allowNavigation(
        () =>
          void navigate(
            `${careChangePath(space.id, result.id)}${state === "unknown" ? "?pendingResult=1" : ""}`,
            { replace: true },
          ),
      );
    });
  }
  const dialog = (
    <UnsavedChangesDialog
      open={blocker.state === "blocked"}
      onStay={() => blocker.reset?.()}
      onLeave={() => blocker.proceed?.()}
    />
  );
  if (timeScreen.open)
    return (
      <>
        <TimeSelectionPage
          spaceId={space.id}
          initialValue={draft.fields.time}
          onConfirm={(time) => {
            setDraft({ ...draft, fields: { ...draft.fields, time } });
            timeScreen.close();
          }}
          onBack={timeScreen.close}
        />
        {dialog}
      </>
    );
  return (
    <ProposalPageLayout
      title={
        review
          ? operation === "delete"
            ? `${label} 삭제`
            : "내용 확인"
          : operation === "create"
            ? `${label} 추가`
            : careChangeTitle(draft)
      }
      spaceId={space.id}
      onBack={back}
      preview={{
        value: state,
        options: states,
        onChange: (value) => {
          setState(value);
          setError("");
        },
      }}
      actions={
        blocked ? (
          <Button onClick={back}>항목으로 돌아가기</Button>
        ) : (
          <>
            <Button
              variant={operation === "delete" ? "destructive" : "primary"}
              loading={pending}
              onClick={review ? submit : confirm}
            >
              {review
                ? direct
                  ? `${careChangeTitle(draft)}${operation === "delete" ? "" : " 반영"}`
                  : `${careChangeTitle(draft)} 요청`
                : operation === "create"
                  ? "입력 내용 확인"
                  : operation === "answer"
                    ? "답변 내용 확인"
                    : "변경 내용 확인"}
            </Button>
            <TextAction
              disabled={pending}
              onClick={() =>
                review && operation !== "delete" ? setReview(false) : back()
              }
            >
              {review && operation !== "delete" ? "내용 다시 수정" : "돌아가기"}
            </TextAction>
          </>
        )
      }
    >
      {blocked ? (
        <Notice
          tone="error"
          title={
            state === "locked"
              ? "다른 가족이 편집 중이에요"
              : "현재 참여 권한을 확인해 주세요"
          }
          body="지금은 변경할 수 없어요. 이 상태는 Mock 예시이며 실제 잠금·권한 확인은 API 연결 후 적용해요."
        />
      ) : (
        <>
          <Badge
            className="self-start"
            label={
              review
                ? direct
                  ? "최종 확인"
                  : "승인 요청"
                : operation === "create"
                  ? `${space.subjectLabel}의 돌봄`
                  : "수정 중"
            }
          />
          <h1 className="text-hm-title-page">
            {review
              ? operation === "delete"
                ? `이 ${label} 항목을 삭제할까요?`
                : direct
                  ? "이 내용으로 반영할까요?"
                  : "이 내용으로 요청할까요?"
              : heading}
          </h1>
          {error && (
            <Notice
              role="alert"
              tone="error"
              title="반영하지 못했어요"
              body={error}
            />
          )}
          {review ? (
            <CareChangeSummary
              draft={draft}
              before={item}
              space={space}
            />
          ) : (
            <CareChangeInputs
              draft={draft}
              item={item}
              space={space}
              onChange={setDraft}
              onTimeSelect={timeScreen.show}
              disabled={pending}
              showErrors={Boolean(error)}
            />
          )}
          {!review && operation === "edit" && item && (
            <MenuRow
              icon="link-brand"
              title="기존 근거 보기"
              description="원본 내용은 읽기 전용"
              onClick={() => setSources(true)}
            />
          )}
          {operation === "delete" && (
            <>
              <Notice
                title="돌봄 목록과 홈에서 숨겨져요"
                body="변경 이력과 소식 원본은 유지돼요. 공유된 링크에서는 항목 상세를 볼 수 없어요."
              />
              {item?.kind === "schedule" && item.status === "scheduled" && (
                <MenuRow
                  title="일정 취소로 기록하기"
                  description="삭제 대신 취소된 일정으로 남기려면"
                  onClick={() =>
                    void navigate(`${careItemPath(space.id, item.id)}/status`)
                  }
                />
              )}
            </>
          )}
          <Notice
            title={direct ? "확인 후 반영해요" : "현재 돌봄 정보는 그대로예요"}
            body={
              direct
                ? "최종 확인한 내용과 변경 이력이 함께 갱신돼요."
                : "소유자가 요청 내용과 근거를 확인한 뒤 최종 반영해요. 답변 제출만으로 질문이 확인됨으로 바뀌지 않아요."
            }
          />
        </>
      )}
      <BottomSheet
        open={sources}
        onOpenChange={setSources}
        title="기존 근거"
        footer={
          <Button onClick={() => setSources(false)}>수정 계속하기</Button>
        }
      >
        {item && (
          <CareEvidenceList
            item={item}
            records={records}
            onSource={(id) => void navigate(newsDetailPath(space.id, id))}
          />
        )}
      </BottomSheet>
      {dialog}
    </ProposalPageLayout>
  );
}
