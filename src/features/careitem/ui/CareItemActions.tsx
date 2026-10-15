import { Button, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { CareItemView } from "../model/careItemViewTypes";

// 아직 구현하지 않은 관리 흐름은 요청이나 성공으로 가장하지 않는다.
export function CareItemActions({
  item,
  space,
  onReconfirm,
}: {
  item: CareItemView;
  space: CareSpaceView;
  onReconfirm: () => void;
}) {
  if (item.needsReconfirmation)
    return space.role === "owner" ? (
      <Button onClick={onReconfirm}>새 내용으로 확인</Button>
    ) : null;
  let primary: string | undefined;
  let secondary: string | undefined;
  if (item.kind === "schedule" && item.status === "scheduled") {
    primary = space.role === "owner" ? "일정 변경" : "일정 변경 요청";
    secondary =
      space.role === "owner" ? "일정 상태 변경" : "일정 상태 변경 요청";
  } else if (item.kind === "task") {
    const canChange =
      space.role === "owner" ||
      space.members.some(
        (member) => member.self && member.id === item.fields.assigneeId,
      );
    primary = canChange
      ? item.status === "completed"
        ? "완료 취소"
        : "완료로 표시"
      : "상태 변경 요청";
    secondary = canChange
      ? item.status === "not-started"
        ? "진행 시작"
        : undefined
      : "내용·담당자 변경 요청";
  } else if (item.kind === "question" && item.status === "unconfirmed")
    primary = "답변 남기기";
  return (
    <>
      {primary && <Button disabled>{primary} · 준비 중</Button>}
      {secondary && <TextAction disabled>{secondary} · 준비 중</TextAction>}
    </>
  );
}
