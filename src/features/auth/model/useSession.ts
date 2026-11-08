import { useContext, useSyncExternalStore } from "react";
import { SessionContext } from "./sessionContext";

export function useSession() {
  const controller = useContext(SessionContext);
  if (!controller) throw new Error("SessionProvider가 필요합니다.");
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );
  return { ...state, check: controller.check, signOut: controller.signOut };
}
