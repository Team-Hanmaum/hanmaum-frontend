import { useSyncExternalStore } from "react";
import { isMockPreviewEnabled } from "@/lib/mockPreview";

type AccountStatus =
  | "active"
  | "signed-out"
  | "logout-unknown"
  | "withdrawn"
  | "withdrawal-unknown";
type MockAccount = {
  name: string;
  provider: "google" | "kakao";
  status: AccountStatus;
};
let snapshot: MockAccount = {
  name: "수진",
  provider: "google",
  status: "active",
};
const listeners = new Set<() => void>();
function publish(next: MockAccount) {
  if (!isMockPreviewEnabled) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}
// 화면 확인용 메모리 상태. 실제 세션·OAuth·계정 삭제와 무관하며 새로고침 시 초기화한다.
export const mockAccount = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  login(provider: MockAccount["provider"]) {
    publish({ ...snapshot, provider, status: "active" });
  },
  setStatus(status: AccountStatus) {
    publish({ ...snapshot, status });
  },
};
export function useMockAccount() {
  return useSyncExternalStore(
    mockAccount.subscribe,
    mockAccount.getSnapshot,
    mockAccount.getSnapshot,
  );
}
