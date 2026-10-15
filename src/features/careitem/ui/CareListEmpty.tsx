import { EmptyState } from "@/components/feedback";
import { MenuRow } from "@/components/ui";
import { careKindLabels } from "../model/careItemViewTypes";
import type { CareListFilter } from "../model/careItemSelectors";

export function CareListEmpty({
  filter,
  first,
  onCompleted,
}: {
  filter: CareListFilter;
  first: boolean;
  onCompleted: () => void;
}) {
  if (!first && filter.type === "task" && filter.status === "remaining")
    return (
      <>
        <h2 className="text-hm-title-page">남은 할 일이 없어요</h2>
        <p className="text-hm-body-default text-hm-text-secondary">
          끝낸 일은 완료 목록에서 볼 수 있어요.
        </p>
        <MenuRow
          icon="check"
          title="완료한 할 일 보기"
          onClick={onCompleted}
        />
      </>
    );
  const messages = {
    schedule: "다가오는 돌봄 일정을 추가하고 가족과 함께 확인해 보세요.",
    task: "가족이 함께 챙길 일을 추가해 보세요.",
    question: "가족과 확인하고 싶은 내용을 남겨 보세요.",
    observation: "보고 들은 내용을 소식으로 남겨 주세요.",
    guidance: "기관에서 전달받은 내용을 소식으로 남겨 주세요.",
  };
  const emptyTitles = {
    upcoming: "다가오는 일정이 없어요",
    past: "지난 일정이 없어요",
    closed: "완료·취소된 일정이 없어요",
    completed: "완료한 할 일이 없어요",
    unconfirmed: "미확인 질문이 없어요",
    confirmed: "확인된 질문이 없어요",
    remaining: "남은 할 일이 없어요",
  };
  return (
    <EmptyState
      icon={filter.type === "schedule" ? "care-brand" : "news-brand"}
      title={
        first || !filter.status
          ? `아직 등록된 ${careKindLabels[filter.type]}이 없어요`
          : emptyTitles[filter.status]
      }
      body={
        first || !filter.status
          ? messages[filter.type]
          : "다른 목록에서 현재 돌봄 정보를 확인할 수 있어요."
      }
    />
  );
}
