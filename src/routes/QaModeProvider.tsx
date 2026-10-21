import { useAppNavigate } from "@/routes/useAppNavigate";
import { useSyncExternalStore, type ReactNode } from "react";
import { useLocation } from "react-router";
import { qaMode } from "@/lib/qaMode";
import { QaModeContext } from "@/lib/useQaMode";

export function QaModeProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(qaMode.subscribe, qaMode.getSnapshot);
  const location = useLocation();
  const navigate = useAppNavigate();

  function exit() {
    const params = new URLSearchParams(location.search);
    params.delete("qa");
    params.delete("qaState");
    qaMode.set(false);
    void navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
        hash: location.hash,
      },
      { replace: true, preventScrollReset: true, state: location.state },
    );
  }

  return <QaModeContext value={{ enabled, exit }}>{children}</QaModeContext>;
}
