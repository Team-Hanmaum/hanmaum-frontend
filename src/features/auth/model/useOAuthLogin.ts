import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SocialProvider } from "@/components/ui";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { resetSessionState } from "./resetSessionState";
import { saveLoginReturn } from "./loginReturn";
import { getOAuthLoginUrl } from "./getOAuthLoginUrl";
import { publishSessionChange } from "./sessionChanges";
import {
  OAuthPreparationError,
  prepareOAuthSession,
} from "./prepareOAuthSession";

const preparationTimeoutMs = 20_000;

export function useOAuthLogin() {
  const queryClient = useQueryClient();
  const pending = useRef<AbortController | null>(null);
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const cancel = () => {
      pending.current?.abort();
      pending.current = null;
    };
    const restore = () => {
      cancel();
      setProvider(null);
    };
    window.addEventListener("pageshow", restore);
    window.addEventListener("pagehide", cancel);
    return () => {
      cancel();
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("pagehide", cancel);
    };
  }, []);
  async function start(next: SocialProvider, returnTo?: string) {
    if (isMockPreviewEnabled || pending.current) return;
    const attempt = new AbortController();
    pending.current = attempt;
    setProvider(next);
    setError("");
    const timeout = window.setTimeout(
      () =>
        attempt.abort(
          new DOMException("Login preparation timed out", "TimeoutError"),
        ),
      preparationTimeoutMs,
    );
    try {
      const url = getOAuthLoginUrl(next, window.location.origin);
      await resetSessionState(queryClient);
      await prepareOAuthSession(attempt.signal, () => {
        if (returnTo) saveLoginReturn(returnTo);
        publishSessionChange();
        // 세션 준비 응답 후에만 BE의 OAuth 시작 주소로 브라우저를 이동한다.
        window.location.assign(url);
      });
    } catch (failure) {
      if (pending.current !== attempt) return;
      pending.current = null;
      setProvider(null);
      setError(
        failure instanceof OAuthPreparationError
          ? failure.message
          : attempt.signal.reason instanceof DOMException &&
              attempt.signal.reason.name === "TimeoutError"
            ? "로그인 준비가 지연되고 있어요. 잠시 후 다시 시도해 주세요."
            : "로그인을 시작하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
      );
    } finally {
      window.clearTimeout(timeout);
    }
  }
  return { provider, error, start };
}
