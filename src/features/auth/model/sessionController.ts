import type { Query, QueryClient } from "@tanstack/react-query";
import {
  ApiError,
  isUnauthenticated,
  resetCsrfToken,
  normalizeApiError,
} from "@/lib/api";
import { getMe } from "@/features/user/api/userApi";
import type { MyProfile } from "@/features/user/api/userTypes";
import { userKeys } from "@/features/user/model/userKeys";
import { logout } from "../api/authApi";
import { resetSessionState } from "./resetSessionState";
import { cancelProtectedRequests } from "@/lib/api/apiSession";
import { publishSessionChange } from "./sessionChanges";

const recheckInterval = 60_000;

export type SessionState =
  | { status: "checking" | "signing-out" }
  | {
      status: "authenticated";
      user: MyProfile;
      revalidation?:
        { status: "checking" } | { status: "error"; error: ApiError };
    }
  | { status: "anonymous"; reason: "required" | "expired" | "signed-out" }
  | { status: "error" | "logout-unknown"; error: ApiError };

// One owner for transitions. The revision prevents late requests from reviving an old session.
export function createSessionController(queryClient: QueryClient) {
  let state: SessionState = { status: "checking" };
  let user: MyProfile | undefined;
  let revision = 0;
  let logoutPending = false;
  let pendingCheck: Promise<void> | undefined;
  let checkController: AbortController | undefined;
  let verifiedAt = 0;
  let uncertain = true;
  let remoteChange = false;
  const interruptedQueries = new Set<Query>();
  let cleanup: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();
  const publish = (next: SessionState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  function clear(reason: "required" | "expired" | "signed-out") {
    revision += 1;
    pendingCheck = undefined;
    checkController?.abort();
    uncertain = true;
    verifiedAt = 0;
    interruptedQueries.clear();
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
  function invalidateIdentity(changed = false) {
    if (state.status === "signing-out") return;
    uncertain = true;
    remoteChange ||= changed;
    revision += 1;
    checkController?.abort();
    pendingCheck = undefined;
    cancelProtectedRequests();
    for (const query of queryClient.getQueryCache().getAll()) {
      if (query.isActive() && query.state.fetchStatus === "fetching")
        interruptedQueries.add(query);
    }
    // Revert interrupted reads to their last verified data instead of showing errors.
    cleanup = Promise.all([cleanup, queryClient.cancelQueries()]).then(
      () => undefined,
    );
    if (changed) resetCsrfToken();
    if (
      state.status === "authenticated" &&
      state.revalidation?.status === "checking"
    )
      publish({ status: "authenticated", user: state.user });
  }
  function recheck() {
    if (
      state.status === "authenticated" &&
      !remoteChange &&
      interruptedQueries.size === 0 &&
      !state.revalidation &&
      Date.now() - verifiedAt < recheckInterval
    )
      return Promise.resolve();
    return check();
  }
  async function ensureIdentity() {
    const accountId = user?.userId;
    if (uncertain || Date.now() - verifiedAt >= recheckInterval || pendingCheck)
      await check();
    if (
      state.status === "authenticated" &&
      state.revalidation?.status === "error"
    )
      throw state.revalidation.error;
    if (
      state.status !== "authenticated" ||
      uncertain ||
      (accountId !== undefined && accountId !== state.user.userId)
    )
      throw new ApiError({
        kind: "cancelled",
        message:
          "로그인 상태가 변경됐어요. 화면을 확인한 뒤 다시 진행해 주세요.",
      });
  }
  function check() {
    if (pendingCheck) return pendingCheck;
    if (state.status === "signing-out") return Promise.resolve();
    const recoveringLogout = logoutPending;
    const currentRevision = ++revision;
    checkController = new AbortController();
    const signal = checkController.signal;
    const previousUser =
      state.status === "authenticated" ? state.user : undefined;
    // Keep the last verified screen mounted. The API gate holds all new protected requests.
    publish(
      previousUser
        ? {
            status: "authenticated",
            user: previousUser,
            revalidation: { status: "checking" },
          }
        : { status: "checking" },
    );
    const task = (async () => {
      await cleanup;
      if (currentRevision !== revision) return;
      try {
        const profile = await getMe(signal);
        if (currentRevision !== revision) return;
        if (user && user.userId !== profile.userId) {
          await resetSessionState(queryClient);
          if (currentRevision !== revision) return;
        }
        user = profile;
        verifiedAt = Date.now();
        uncertain = false;
        remoteChange = false;
        logoutPending = false;
        queryClient.setQueryData(userKeys.me(), profile);
        publish({ status: "authenticated", user: profile });
      } catch (error) {
        if (currentRevision !== revision) return;
        uncertain = true;
        if (isUnauthenticated(error)) {
          await clear(
            recoveringLogout ? "signed-out" : user ? "expired" : "required",
          );
        } else if (previousUser) {
          publish({
            status: "authenticated",
            user: previousUser,
            revalidation: { status: "error", error: normalizeApiError(error) },
          });
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
      if (pendingCheck !== task) return;
      pendingCheck = undefined;
      if (!uncertain && state.status === "authenticated") {
        const interrupted = new Set(interruptedQueries);
        interruptedQueries.clear();
        // Resume only still-mounted reads interrupted by focus loss. Account reset
        // removes old Query instances, so they cannot be resumed for another user.
        void queryClient.refetchQueries(
          {
            predicate: (query) => interrupted.has(query) && query.isActive(),
          },
          { cancelRefetch: false },
        );
      }
    });
    return task;
  }
  async function signOut() {
    if (state.status === "signing-out") return;
    await ensureIdentity();
    if (logoutPending) return;
    const currentRevision = ++revision;
    pendingCheck = undefined;
    logoutPending = true;
    publishSessionChange();
    publish({ status: "signing-out" });
    // Cancel account reads before starting the logout request itself.
    await resetSessionState(queryClient);
    if (currentRevision !== revision) return;
    try {
      await logout();
      if (currentRevision === revision) {
        await clear("signed-out");
        publishSessionChange();
      }
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
    getAccountId: () => user?.userId,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    check,
    recheck,
    invalidateIdentity,
    ensureIdentity,
    expire,
    signOut,
  };
}

export type SessionController = ReturnType<typeof createSessionController>;
