import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { Modal } from "./Modal";
export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  onConfirm: () => void;
  intent?: "default" | "destructive";
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  confirmDisabled?: boolean;
  feedback?: ReactNode;
};
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  onConfirm,
  intent = "default",
  confirmLabel = intent === "destructive" ? "삭제하기" : "확인",
  cancelLabel = "취소",
  busy = false,
  confirmDisabled = false,
  feedback,
}: ConfirmDialogProps) {
  const id = useId();
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      titleId={`${id}-title`}
      descriptionId={`${id}-body`}
      busy={busy}
      variant="dialog"
    >
      <div className="flex min-w-0 flex-col gap-hm-16 rounded-hm-20 bg-hm-bg-surface p-hm-24 wrap-anywhere">
        <h2
          id={`${id}-title`}
          className="text-hm-heading-section"
        >
          {title}
        </h2>
        <p
          id={`${id}-body`}
          className="text-hm-body-default whitespace-pre-wrap text-hm-text-secondary"
        >
          {body}
        </p>
        {feedback}
        <Button
          variant={intent === "destructive" ? "destructive" : "primary"}
          onClick={onConfirm}
          loading={busy}
          disabled={confirmDisabled}
          className="w-full"
        >
          {confirmLabel}
        </Button>
        <Button
          data-initial-focus
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={busy}
          className="w-full"
        >
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
