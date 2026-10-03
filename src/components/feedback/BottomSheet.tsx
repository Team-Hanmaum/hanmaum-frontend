import { useId, type ReactNode } from "react";
import { IconButton } from "@/components/ui";
import { Modal } from "./Modal";
export type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
};
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  busy = false,
  closeLabel = "닫기",
  closeOnBackdrop = false,
}: BottomSheetProps) {
  const id = useId();
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      titleId={`${id}-title`}
      descriptionId={description ? `${id}-description` : undefined}
      busy={busy}
      variant="sheet"
      closeOnBackdrop={closeOnBackdrop}
    >
      <div className="flex min-w-0 flex-col gap-hm-16 rounded-t-hm-24 bg-hm-bg-surface p-hm-20 pb-[calc(var(--hm-spacing-20)+env(safe-area-inset-bottom))] wrap-anywhere">
        <div className="flex items-center gap-hm-8">
          <h2
            data-initial-focus
            tabIndex={-1}
            id={`${id}-title`}
            className="min-w-0 flex-1 text-hm-heading-section outline-none"
          >
            {title}
          </h2>
          <IconButton
            icon="close"
            label={closeLabel}
            disabled={busy}
            onClick={() => onOpenChange(false)}
          />
        </div>
        {description && (
          <p
            id={`${id}-description`}
            className="text-hm-body-small text-hm-text-secondary"
          >
            {description}
          </p>
        )}
        {children}
        {footer}
      </div>
    </Modal>
  );
}
