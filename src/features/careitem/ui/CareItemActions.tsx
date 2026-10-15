import { Button, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { CareItemView } from "../model/careItemViewTypes";
import { isConfirmedQuestion } from "../model/careItemStatus";

export function CareItemActions({
  item,
  space,
  onReconfirm,
  onAction,
}: {
  item: CareItemView;
  space: CareSpaceView;
  onReconfirm: () => void;
  onAction: (action: "edit" | "status" | "answer", next?: string) => void;
}) {
  if (isConfirmedQuestion(item)) return null;
  if (item.needsReconfirmation)
    return space.role === "owner" ? (
      <Button onClick={onReconfirm}>새 내용으로 확인</Button>
    ) : null;
  if (item.kind === "schedule" && item.status === "scheduled")
    return (
      <>
        <Button onClick={() => onAction("edit")}>
          {space.role === "owner" ? "일정 변경" : "일정 변경 요청"}
        </Button>
        <TextAction onClick={() => onAction("status")}>
          {space.role === "owner" ? "일정 상태 변경" : "일정 상태 변경 요청"}
        </TextAction>
      </>
    );
  if (item.kind === "task") {
    const canChange =
      space.role === "owner" ||
      space.members.some(
        (member) => member.self && member.id === item.fields.assigneeId,
      );
    return (
      <>
        <Button
          onClick={() =>
            onAction(
              "status",
              item.status === "completed" ? "in-progress" : "completed",
            )
          }
        >
          {canChange
            ? item.status === "completed"
              ? "완료 취소"
              : "완료로 표시"
            : "상태 변경 요청"}
        </Button>
        {canChange && item.status === "not-started" && (
          <TextAction onClick={() => onAction("status", "in-progress")}>
            진행 시작
          </TextAction>
        )}
        {!canChange && (
          <TextAction onClick={() => onAction("edit")}>
            내용·담당자 변경 요청
          </TextAction>
        )}
      </>
    );
  }
  if (item.kind === "question" && item.status === "unconfirmed")
    return <Button onClick={() => onAction("answer")}>답변 남기기</Button>;
  return null;
}
