import { useEffect, useState } from "react";
import { getInstalledPwa } from "./getInstalledPwa";
import { isStandalone } from "./installEnvironment";

export function useInstalledPwa() {
  const [standalone, setStandalone] = useState(isStandalone);
  const [completed, setCompleted] = useState(false);
  const [relatedInstalled, setRelatedInstalled] = useState<boolean | null>(
    null,
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = async (returning = false) => {
      const current = ++revision;
      const result = await getInstalledPwa();
      if (!active || current !== revision) return;
      setRelatedInstalled(result);
      setChecking(false);
      // 브라우저로 돌아왔을 때 삭제된 앱을 계속 설치됨으로 표시하지 않는다.
      if (returning && result === false) setCompleted(false);
    };
    const onInstalled = () => {
      setCompleted(true);
      void refresh();
    };
    const onDisplayMode = () => setStandalone(isStandalone());
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh(true);
    };
    const displayMode = window.matchMedia("(display-mode: standalone)");
    window.addEventListener("appinstalled", onInstalled);
    document.addEventListener("visibilitychange", onVisible);
    displayMode.addEventListener("change", onDisplayMode);
    void refresh();
    return () => {
      active = false;
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisible);
      displayMode.removeEventListener("change", onDisplayMode);
    };
  }, []);

  return {
    installed: standalone || completed || relatedInstalled === true,
    installedInBrowser: !standalone && relatedInstalled === true,
    checking,
  };
}
