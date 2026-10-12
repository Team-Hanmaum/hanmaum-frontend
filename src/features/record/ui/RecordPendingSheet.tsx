import { BottomSheet } from "@/components/feedback";

export type RecordPendingAction = "review" | "delete" | "detail" | null;
const messages = {
  review:
    "제안 검토 화면은 다음 작업에서 연결해요. 구성원은 반영을 요청하고, 소유자가 최종 반영해요. 현재 돌봄 정보는 바뀌지 않아요.",
  delete:
    "원본 삭제는 연결된 제안·근거·이력의 영향 확인과 함께 연결할 예정이에요. 지금은 소식이나 돌봄 정보를 삭제하지 않아요.",
  detail:
    "소식 상세 화면을 준비하고 있어요. 지금 보이는 내용은 화면 확인용 예시예요.",
};
export function RecordPendingSheet({
  action,
  onClose,
}: {
  action: RecordPendingAction;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open={action !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="후속 화면 준비 중"
    >
      <p className="text-hm-body-default text-hm-text-secondary">
        {action && messages[action]}
      </p>
    </BottomSheet>
  );
}
