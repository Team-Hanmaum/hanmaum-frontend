import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onUnauthenticated } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { createSessionController } from "../model/sessionController";
import { SessionContext } from "../model/sessionContext";

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session] = useState(() => createSessionController(queryClient));
  useEffect(() => {
    if (isMockPreviewEnabled) return;
    const unsubscribe = onUnauthenticated(session.expire);
    void session.check();
    const recheck = () => {
      const status = session.getSnapshot().status;
      if (
        document.visibilityState === "visible" &&
        status !== "signing-out" &&
        status !== "logout-unknown"
      )
        void session.check();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) recheck();
    };
    window.addEventListener("focus", recheck);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", recheck);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [session]);
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
