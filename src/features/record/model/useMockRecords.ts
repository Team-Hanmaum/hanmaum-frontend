import { useSyncExternalStore } from "react";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { getMockRecordData } from "./mockRecordData";
import { mockRecords } from "./mockRecords";

export function useMockRecords(space: CareSpaceView) {
  const snapshot = useSyncExternalStore(
    mockRecords.subscribe,
    mockRecords.getSnapshot,
  );
  return isMockPreviewEnabled
    ? (snapshot[space.id] ?? getMockRecordData(space))
    : [];
}
