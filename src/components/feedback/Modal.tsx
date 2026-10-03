import type { ReactNode } from "react";
import { useModalDialog } from "./useModalDialog";
import "./modal.css";
export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId?: string;
  busy?: boolean;
  variant: "dialog" | "sheet";
  children: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
};
export function Modal({
  open,
  onOpenChange,
  titleId,
  descriptionId,
  busy = false,
  variant,
  children,
  className = "",
  closeOnBackdrop = false,
}: ModalProps) {
  const ref = useModalDialog(open);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy || undefined}
      className={`hm-modal ${className}`}
      data-variant={variant}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onOpenChange(false);
      }}
      onClose={() => {
        if (open && !ref.current?.open) onOpenChange(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href], button, input, select, textarea, [tabindex], [contenteditable='true']",
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            element.getClientRects().length > 0 &&
            getComputedStyle(element).visibility !== "hidden",
        );
        const first = controls[0];
        const last = controls.at(-1);
        const active = document.activeElement;
        if (!first) {
          event.preventDefault();
          event.currentTarget.focus();
        } else if (
          !controls.includes(active as HTMLElement) ||
          (event.shiftKey ? active === first : active === last)
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      }}
      onClick={(event) => {
        if (closeOnBackdrop && !busy && event.target === event.currentTarget)
          onOpenChange(false);
      }}
    >
      {children}
    </dialog>
  );
}
