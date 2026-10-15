import { ConfirmDialog } from "./ConfirmDialog";

export function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onStay();
      }}
      title="수정 중인 내용을 나갈까요?"
      body="아직 확인하지 않은 수정 내용은 사라져요."
      confirmLabel="수정하지 않고 나가기"
      cancelLabel="계속 수정하기"
      onConfirm={onLeave}
    />
  );
}
