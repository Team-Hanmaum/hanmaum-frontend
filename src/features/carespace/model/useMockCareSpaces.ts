import { useSyncExternalStore } from "react";
import { mockCareSpaces } from "./mockCareSpaces";

export function useMockCareSpaces() {
  return useSyncExternalStore(
    mockCareSpaces.subscribe,
    mockCareSpaces.getSnapshot,
  );
}
