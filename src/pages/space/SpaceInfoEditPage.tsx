import { Button, Field, TextAction } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { SpaceInfoComparison } from "@/features/carespace/ui/SpaceInfoComparison";
import { useSpaceInfoEditor } from "@/features/carespace/model/useSpaceInfoEditor";
import { spaceInfoFailure } from "@/features/carespace/model/spaceInfoFailure";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import {
  spaceInfoPath,
  spaceInfoRequestPath,
  spaceInfoRequestsPath,
} from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function SpaceInfoEditPage() {
  const { space } = useSpaceContext();
  const editor = useSpaceInfoEditor(space);
  const { action, confirming, baseline, query } = editor;
  const owner = baseline.role === "OWNER";
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const { blocker, allowNavigation } = useUnsavedChanges(
    editor.dirty || action.pending || action.uncertain,
  );
  const go = (path: string) => void navigate(withReturn(path));
  const back = () => {
    if (action.pending || action.uncertain) return;
    if (confirming && !action.result) editor.edit();
    else
      void navigate(withReturn(spaceInfoPath(space.spaceId)), {
        motion: "back",
      });
  };
  const result = action.result;
  return (
    <AccountPageLayout
      title={
        result
          ? "공간 정보 처리 결과"
          : confirming
            ? owner
              ? "공간 정보 변경 확인"
              : "수정 요청 확인"
            : "공간 정보 수정"
      }
      onBack={back}
      actions={
        result ? (
          <Button
            onClick={() =>
              allowNavigation(() =>
                go(
                  result.requestId
                    ? spaceInfoRequestPath(space.spaceId, result.requestId)
                    : spaceInfoPath(space.spaceId),
                ),
              )
            }
          >
            {result.requestId ? "요청 상태 확인" : "현재 공간 정보 보기"}
          </Button>
        ) : (
          <>
            <Button
              loading={action.pending}
              disabled={
                !action.uncertain &&
                (editor.blocked ||
                  editor.needsRefresh ||
                  (!editor.changed &&
                    editor.label === editor.space.subjectLabel))
              }
              onClick={editor.proceed}
            >
              {action.uncertain
                ? "같은 요청으로 다시 확인"
                : editor.changed
                  ? "변경 내용 다시 확인"
                  : !confirming
                    ? "변경 내용 확인"
                    : owner
                      ? "변경 내용 반영"
                      : "수정 요청 보내기"}
            </Button>
            <TextAction
              disabled={action.pending || action.uncertain}
              onClick={back}
            >
              {confirming ? "다시 수정하기" : "수정 취소"}
            </TextAction>
          </>
        )
      }
    >
      {result ? (
        <>
          <h1 className="text-hm-title-page">
            {result.role === "OWNER"
              ? "공간 이름을 반영했어요"
              : "수정 요청을 보냈어요"}
          </h1>
          <FamilyInfoCard
            title={
              result.role === "OWNER" ? "반영한 공간 이름" : "요청한 공간 이름"
            }
          >
            {result.subjectLabel}의 돌봄
          </FamilyInfoCard>
          <Notice
            title={
              result.role === "OWNER"
                ? "가족에게 보이는 이름을 수정했어요"
                : "현재 공간 정보는 그대로예요"
            }
            body={
              result.role === "OWNER"
                ? "현재 공간 정보에서 최신 이름을 확인할 수 있어요. 소식과 돌봄 기록은 그대로예요."
                : "소유자가 확인한 뒤 최종 반영해요. 요청 상태에서 결과를 확인해 주세요."
            }
          />
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {confirming ? (
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
          {confirming ? (
            <SpaceInfoComparison
              before={baseline.subjectLabel}
              after={editor.label}
            />
          ) : (
            <>
              <Field
                label="부모님 이름 또는 호칭"
                value={editor.value}
                onChange={(event) => editor.changeValue(event.target.value)}
                helper={`현재: ${editor.space.subjectLabel}`}
                error={editor.validation}
                disabled={action.pending || action.uncertain}
              />
              <FamilyInfoCard title="이렇게 표시돼요">
                {editor.label || "이름 또는 호칭"}의 돌봄
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
          {editor.changed && (
            <Notice
              title="현재 정보와 다시 비교해 주세요"
              body={`현재 이름: ${editor.space.subjectLabel} · 내 역할: ${editor.space.role === "OWNER" ? "소유자" : "구성원"}. 입력한 내용을 다시 확인한 후 진행해 주세요.`}
            />
          )}
          {query.error && (
            <ReviewQueryState
              error={query.error}
              retry={() => void editor.refresh()}
            />
          )}
          {action.error && (
            <Notice
              role="alert"
              tone="error"
              title={
                action.uncertain
                  ? "처리 결과를 다시 확인해 주세요"
                  : "처리하지 못했어요"
              }
              body={spaceInfoFailure(action.error)}
            />
          )}
          {editor.needsRefresh && !action.uncertain && (
            <Button
              variant="secondary"
              loading={query.isFetching}
              onClick={() => void editor.refresh()}
            >
              현재 정보 다시 확인
            </Button>
          )}
          {action.error?.code === "CHANGE_REQUEST_ALREADY_PENDING" && (
            <TextAction
              onClick={() => go(spaceInfoRequestsPath(space.spaceId))}
            >
              이미 보낸 요청 확인
            </TextAction>
          )}
        </>
      )}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        onStay={() => {
          if (blocker.state === "blocked") blocker.reset();
        }}
        onLeave={() => {
          if (!action.pending && blocker.state === "blocked") blocker.proceed();
        }}
        title={
          action.pending
            ? "요청을 처리하고 있어요"
            : action.uncertain
              ? "처리 결과를 확인하지 못했어요"
              : "수정을 취소할까요?"
        }
        body={
          action.pending
            ? "처리가 끝난 뒤 이동해 주세요."
            : action.uncertain
              ? "요청이 저장됐을 수 있어요. 나간 뒤에는 공간 정보와 요청 목록에서 결과를 확인해 주세요."
              : "입력한 내용은 저장되지 않아요. 현재 공간 정보는 그대로예요."
        }
        confirmLabel={action.pending ? "처리 완료 기다리기" : "나가기"}
        cancelLabel="계속 확인하기"
      />
    </AccountPageLayout>
  );
}
