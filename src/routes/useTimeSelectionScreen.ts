import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

// 편집 페이지를 유지한 채 별도 화면을 표시해 아직 저장하지 않은 입력을 보존한다.
export function useTimeSelectionScreen(enabled: boolean) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const open = enabled && params.get("picker") === "time";
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    let frame = 0;
    let previousTitle: string | undefined;
    if (open) {
      // 직접 진입 시 App의 기본 라우트 제목 설정 이후 적용한다.
      frame = requestAnimationFrame(() => {
        previousTitle = document.title;
        document.title = "시간 선택 · 한마음";
      });
      document
        .querySelector<HTMLElement>("main")
        ?.focus({ preventScroll: true });
    } else if (wasOpen.current) {
      frame = requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>('button[aria-label="시간 선택"]')
          ?.focus({ preventScroll: true }),
      );
    }
    wasOpen.current = open;
    return () => {
      cancelAnimationFrame(frame);
      if (previousTitle !== undefined) document.title = previousTitle;
    };
  }, [open]);
  function show() {
    const next = new URLSearchParams(params);
    next.set("picker", "time");
    void setParams(next, {
      state: { ...location.state, timeSelectionFrom: location.pathname },
    });
  }
  function close() {
    if (location.state?.timeSelectionFrom === location.pathname) {
      void navigate(-1);
    } else {
      const next = new URLSearchParams(params);
      next.delete("picker");
      void setParams(next, { replace: true });
    }
  }
  return { open, show, close };
}
