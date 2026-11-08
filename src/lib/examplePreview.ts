import { useSyncExternalStore } from "react";

// Only unconnected domain UIs use this flag. Authentication and connected APIs
// keep using the real session; this never enables the former Mock login mode.
export const isExamplePreviewEnabled = true;
const resets = new Map<string, () => void>();
const listeners = new Set<() => void>();
let revision = 0;
export function registerExampleReset(name: string, reset: () => void) {
  resets.set(name, reset);
}
export function resetExampleData() {
  resets.forEach((reset) => reset());
  revision += 1;
  listeners.forEach((listener) => listener());
}
export function useExampleRevision() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => revision,
  );
}
