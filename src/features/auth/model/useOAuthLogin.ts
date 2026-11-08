import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SocialProvider } from "@/components/ui";
import { getApiBaseUrl } from "@/lib/env";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { resetSessionState } from "./resetSessionState";
import { saveLoginReturn } from "./loginReturn";

export function useOAuthLogin() {
  const queryClient = useQueryClient();
  const pending = useRef(false);
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const restore = () => {
      pending.current = false;
      setProvider(null);
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);
  async function start(next: SocialProvider, returnTo?: string) {
    if (isMockPreviewEnabled || pending.current) return;
    pending.current = true;
    setProvider(next);
    setError("");
    try {
      const url = new URL(`/oauth2/authorization/${next}`, getApiBaseUrl());
      if (returnTo) saveLoginReturn(returnTo);
      await resetSessionState(queryClient);
      // Session cookies and provider redirects are handled by the browser and BE.
      window.location.assign(url.href);
    } catch {
      pending.current = false;
      setProvider(null);
      setError(
        "로그인을 시작하지 못했어요. 연결과 API 주소 설정을 확인해 주세요.",
      );
    }
  }
  return { provider, error, start };
}
