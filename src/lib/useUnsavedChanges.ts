import { useCallback, useRef } from "react";
import { useBeforeUnload, useBlocker } from "react-router";

export function useUnsavedChanges(dirty: boolean) {
  const allowed = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !allowed.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  useBeforeUnload(
    useCallback(
      (event) => {
        if (dirty && !allowed.current) {
          event.preventDefault();
          event.returnValue = "";
        }
      },
      [dirty],
    ),
  );
  return {
    blocker,
    allowNavigation(action: () => void) {
      allowed.current = true;
      action();
    },
  };
}
