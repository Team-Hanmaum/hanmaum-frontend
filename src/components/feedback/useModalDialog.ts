import { useEffect, useRef } from "react";
let modalCount = 0;
let previousOverflow = "";
export function useModalDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (modalCount++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    if (!dialog.open) dialog.showModal();
    dialog
      .querySelector<HTMLElement>("[data-initial-focus]")
      ?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      if (--modalCount === 0) document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}
