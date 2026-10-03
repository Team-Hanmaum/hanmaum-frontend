import { useEffect, useRef, useState } from "react";
import type { SocialProvider } from "@/components/ui";

export function useLoginPreview() {
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState("실제 로그인·계정 생성 없음");
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pending.current !== null) clearTimeout(pending.current);
    },
    [],
  );
  function previewLogin(nextProvider: SocialProvider) {
    if (pending.current !== null) return;
    setProvider(nextProvider);
    setMessage("로딩 상태 확인 중 · 실제 인증 요청 없음");
    pending.current = setTimeout(() => {
      pending.current = null;
      setProvider(null);
      setMessage("상태 확인 완료 · 실제 로그인·계정 생성 없음");
    }, 1000);
  }
  return { provider, message, previewLogin };
}
