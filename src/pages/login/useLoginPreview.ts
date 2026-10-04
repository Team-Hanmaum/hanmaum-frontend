import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { SocialProvider } from "@/components/ui";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { paths } from "@/routes/paths";

export function useLoginPreview() {
  const navigate = useNavigate();
  const enabled = isMockPreviewEnabled;
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState(
    enabled
      ? "화면 확인용 이동 · 실제 로그인·계정 생성 없음"
      : "화면 미리보기 · 실제 로그인 기능 연결 전",
  );
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pending.current !== null) clearTimeout(pending.current);
      pending.current = null;
    },
    [],
  );
  function previewLogin(nextProvider: SocialProvider) {
    if (!enabled || pending.current !== null) return;
    setProvider(nextProvider);
    setMessage("안내 화면으로 이동 중 · 실제 인증 요청 없음");
    pending.current = setTimeout(() => {
      pending.current = null;
      setProvider(null);
      void navigate(paths.onboardingGuide);
    }, 1000);
  }
  return { enabled, provider, message, previewLogin };
}
