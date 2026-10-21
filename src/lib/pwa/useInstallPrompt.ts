import { useEffect, useRef, useState } from "react";
import {
  getInstallGuide,
  isInstallDismissed,
  isStandalone,
  saveInstallDismissal,
} from "./installEnvironment";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt(autoPrompt: boolean) {
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(isInstallDismissed);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const installing = useRef(false);
  const mounted = useRef(false);
  const guide = getInstallGuide(navigator.userAgent, navigator.maxTouchPoints);

  useEffect(() => {
    mounted.current = true;
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const complete = () => {
      setInstalled(true);
      setOpen(false);
      setPromptEvent(null);
    };
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateDisplayMode = () => {
      if (isStandalone()) complete();
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", complete);
    displayMode.addEventListener("change", updateDisplayMode);
    return () => {
      mounted.current = false;
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", complete);
      displayMode.removeEventListener("change", updateDisplayMode);
    };
  }, []);

  useEffect(() => {
    if (!autoPrompt || installed || dismissed || guide === "desktop") return;
    let shown = false;
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (
          shown ||
          document.visibilityState !== "visible" ||
          document.querySelector("dialog[open]") ||
          document.activeElement?.matches(
            "input, textarea, select, [contenteditable='true']",
          )
        )
          return;
        shown = true;
        setOpen(true);
      }, 900);
    };
    schedule();
    document.addEventListener("focusout", schedule);
    document.addEventListener("visibilitychange", schedule);
    document.addEventListener("close", schedule, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("focusout", schedule);
      document.removeEventListener("visibilitychange", schedule);
      document.removeEventListener("close", schedule, true);
    };
  }, [autoPrompt, installed, dismissed, guide]);

  function dismiss(permanent = false) {
    saveInstallDismissal(permanent);
    setDismissed(true);
    setOpen(false);
  }

  async function install() {
    if (!promptEvent || installing.current) return;
    installing.current = true;
    setBusy(true);
    setError("");
    try {
      // 브라우저 설치 창은 사용자가 버튼을 누른 직후에만 호출한다.
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (!mounted.current) return;
      if (choice.outcome === "accepted") setInstalled(true);
      dismiss();
    } catch {
      if (mounted.current)
        setError(
          "설치 창을 열지 못했어요. 아래 브라우저 메뉴를 이용해 주세요.",
        );
    } finally {
      installing.current = false;
      if (mounted.current) {
        setPromptEvent(null); // 설치 이벤트는 한 번만 사용할 수 있다.
        setBusy(false);
      }
    }
  }

  return {
    open: open && !installed,
    installed,
    guide,
    busy,
    error,
    canInstall: promptEvent !== null,
    dismiss,
    install,
    showInstall: () => {
      if (!installed) {
        setError("");
        setOpen(true);
      }
    },
  };
}
