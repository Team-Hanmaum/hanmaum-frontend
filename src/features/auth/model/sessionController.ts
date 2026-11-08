import type { QueryClient } from "@tanstack/react-query";
import { ApiError, isUnauthenticated, resetCsrfToken } from "@/lib/api";
import { normalizeApiError } from "@/lib/api/apiError";
import { getMe } from "@/features/user/api/userApi";
import type { MyProfile } from "@/features/user/api/userTypes";
import { userKeys } from "@/features/user/model/userKeys";
import { logout } from "../api/authApi";
import { resetSessionState } from "./resetSessionState";

export type SessionState =
  | { status: "checking" | "signing-out" }
  | { status: "authenticated"; user: MyProfile }
  | { status: "anonymous"; reason: "required" | "expired" | "signed-out" }
  | { status: "error" | "logout-unknown"; error: ApiError };

// One owner for transitions. The revision prevents late requests from reviving an old session.
export function createSessionController(queryClient: QueryClient) {
  let state: SessionState = { status: "checking" };
  let user: MyProfile | undefined;
  let revision = 0;
  let logoutPending = false;
  let pendingCheck: Promise<void> | undefined;
  let cleanup: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();
  const publish = (next: SessionState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  function clear(reason: "required" | "expired" | "signed-out") {
    revision += 1;
    pendingCheck = undefined;
    user = undefined;
    logoutPending = false;
    publish({ status: "anonymous", reason });
    cleanup = resetSessionState(queryClient);
    return cleanup;
  }
  function expire() {
    const reason = logoutPending ? "signed-out" : user ? "expired" : "required";
    void clear(reason);
  }
  function check() {
    if (pendingCheck) return pendingCheck;
    if (state.status === "signing-out") return Promise.resolve();
    const recoveringLogout = logoutPending;
    const currentRevision = ++revision;
    // Background revalidation must not unmount a form merely because the tab regained focus.
    if (state.status !== "authenticated") publish({ status: "checking" });
    const task = (async () => {
      await cleanup;
      if (currentRevision !== revision) return;
      try {
        const profile = await getMe();
        if (currentRevision !== revision) return;
        if (user && user.userId !== profile.userId) {
          await resetSessionState(queryClient);
          if (currentRevision !== revision) return;
        }
        user = profile;
        logoutPending = false;
        queryClient.setQueryData(userKeys.me(), profile);
        publish({ status: "authenticated", user: profile });
      } catch (error) {
        if (currentRevision !== revision) return;
        if (isUnauthenticated(error)) {
          await clear(
            recoveringLogout ? "signed-out" : user ? "expired" : "required",
          );
        } else {
          publish({
            status: recoveringLogout ? "logout-unknown" : "error",
            error: normalizeApiError(error),
          });
        }
      }
    })();
    pendingCheck = task;
    void task.finally(() => {
      if (pendingCheck === task) pendingCheck = undefined;
    });
    return task;
  }
  async function signOut() {
    if (state.status === "signing-out") return;
    const currentRevision = ++revision;
    pendingCheck = undefined;
    logoutPending = true;
    publish({ status: "signing-out" });
    // Cancel account reads before starting the logout request itself.
    await resetSessionState(queryClient);
    if (currentRevision !== revision) return;
    try {
      await logout();
      if (currentRevision === revision) await clear("signed-out");
    } catch (error) {
      if (currentRevision !== revision) return;
      if (isUnauthenticated(error)) {
        await clear("signed-out");
        return;
      }
      const failure = normalizeApiError(error);
      if (
        (failure.status === 403 || failure.kind === "configuration") &&
        user
      ) {
        // A 403 can be CSRF or permission failure. Never automatically resend the POST.
        resetCsrfToken();
        logoutPending = false;
        publish({ status: "authenticated", user });
      } else publish({ status: "logout-unknown", error: failure });
      throw failure;
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    check,
    expire,
    signOut,
  };
}

export type SessionController = ReturnType<typeof createSessionController>;
