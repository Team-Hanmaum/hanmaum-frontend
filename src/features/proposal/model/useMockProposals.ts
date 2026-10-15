import { useSyncExternalStore } from "react";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { mockProposals } from "./mockProposals";

export function useMockProposals(space: CareSpaceView) {
  const snapshot = useSyncExternalStore(
    mockProposals.subscribe,
    mockProposals.getSnapshot,
  );
  return snapshot[space.id] ?? mockProposals.getForSpace(space);
}
