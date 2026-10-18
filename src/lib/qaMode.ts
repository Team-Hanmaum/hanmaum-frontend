const storageKey = "hanmaum:qa-mode";

// QA 도구 허용 여부와 Mock 데이터/동작 활성화는 별도 설정이다.
export const isQaToolsAllowed =
  import.meta.env.VITE_ENABLE_QA_TOOLS === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_ENABLE_QA_TOOLS === undefined);

function readSavedMode() {
  if (!isQaToolsAllowed) return false;
  try {
    return sessionStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

let enabled = readSavedMode();
const listeners = new Set<() => void>();

export const qaMode = {
  getSnapshot: () => enabled,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  set(value: boolean) {
    const next = isQaToolsAllowed && value;
    try {
      if (next) sessionStorage.setItem(storageKey, "1");
      else sessionStorage.removeItem(storageKey);
    } catch {
      // 저장소를 차단한 브라우저에서도 현재 실행 중의 화면 이동은 지원한다.
    }
    if (enabled === next) return;
    enabled = next;
    listeners.forEach((listener) => listener());
  },
  readSearch(search: string) {
    const requested = new URLSearchParams(search).get("qa");
    if (requested === "1" || requested === "0") this.set(requested === "1");
  },
};
