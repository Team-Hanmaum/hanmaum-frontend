import { useEffect, useRef, useState } from "react";
import type { ShareCard } from "../api/shareLinkTypes";
import {
  hasKakaoShareKey,
  openKakaoShare,
  prepareKakaoShare,
} from "./kakaoShare";

export function useShareActions() {
  const [sdk, setSdk] = useState<"missing" | "loading" | "ready" | "error">(
    () => (hasKakaoShareKey() ? "loading" : "missing"),
  );
  const [feedback, setFeedback] = useState("");
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const active = useRef(true);

  function prepare() {
    if (!hasKakaoShareKey()) return;
    return prepareKakaoShare().then(
      () => {
        if (active.current) setSdk("ready");
      },
      () => {
        if (active.current) setSdk("error");
      },
    );
  }
  useEffect(() => {
    active.current = true;
    void prepare();
    return () => {
      active.current = false;
    };
  }, []);

  async function copy(url: string) {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    try {
      await navigator.clipboard.writeText(url);
      if (active.current)
        setFeedback(
          "공유 링크를 복사했어요. 가족과 대화하는 곳에 붙여넣어 주세요.",
        );
    } catch {
      if (active.current) {
        setFeedback(
          "자동 복사를 사용할 수 없어요. 링크를 직접 선택해 복사해 주세요.",
        );
        setFallbackOpen(true);
      }
    } finally {
      working.current = false;
      if (active.current) setBusy(false);
    }
  }
  function share(card: ShareCard) {
    if (working.current || sdk !== "ready") return;
    working.current = true;
    setBusy(true);
    setFeedback("");
    try {
      openKakaoShare(card);
      if (active.current)
        setFeedback(
          "카카오톡에서 받는 사람을 선택해 보내 주세요. 이 화면에서는 실제 전송 여부를 확인할 수 없어요.",
        );
    } catch (error) {
      if (active.current)
        setFeedback(
          error instanceof DOMException && error.name === "AbortError"
            ? "공유를 취소했어요. 다시 공유하거나 링크를 복사할 수 있어요."
            : "카카오톡 공유를 열지 못했어요. 다시 시도하거나 링크를 복사해 주세요.",
        );
    } finally {
      working.current = false;
      if (active.current) setBusy(false);
    }
  }
  return {
    sdk,
    feedback,
    fallbackOpen,
    setFallbackOpen,
    busy,
    copy,
    share,
    retrySdk: () => {
      setSdk("loading");
      return prepare();
    },
  };
}
