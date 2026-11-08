import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onUnauthenticated } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { createSessionController } from "../model/sessionController";
import { SessionContext } from "../model/sessionContext";
import { registerSessionGuard } from "@/lib/api/apiSession";
import { onSessionChange } from "../model/sessionChanges";

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session] = useState(() => createSessionController(queryClient));
  useEffect(() => {
    if (isMockPreviewEnabled) return;
    const removeGuard = registerSessionGuard(session.ensureIdentity);
    const unsubscribe = onUnauthenticated(session.expire);
    void session.check();
    const recheck = () => {
      const status = session.getSnapshot().status;
      if (
        document.visibilityState === "visible" &&
        status !== "signing-out" &&
        status !== "logout-unknown"
      )
        void session.recheck();
    };
    const invalidate = () => session.invalidateIdentity();
    const visibility = () => {
      if (document.visibilityState === "hidden") invalidate();
      else recheck();
    };
    const removeChanges = onSessionChange(() => {
      session.invalidateIdentity(true);
      recheck();
    });
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        session.invalidateIdentity(true);
        recheck();
      }
    };
    window.addEventListener("focus", recheck);
    window.addEventListener("blur", invalidate);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      unsubscribe();
      removeGuard();
      removeChanges();
      window.removeEventListener("focus", recheck);
      window.removeEventListener("blur", invalidate);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [session]);
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
