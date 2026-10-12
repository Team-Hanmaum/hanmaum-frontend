import { useEffect, useRef, useState } from "react";
import { isMockPreviewEnabled } from "./mockPreview";

// UI 전용 지연. 서버 요청 없이 로딩을 보여주며 이탈 시 후속 동작을 취소한다.
export function useMockAction() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
    },
    [],
  );
  function run(action: () => void) {
    if (!isMockPreviewEnabled || timer.current !== null) return;
    setPending(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setPending(false);
      action();
    }, 650);
  }
  return { pending, run };
}
