import type { RecordView } from "./recordViewTypes";

// Legacy screen state starts empty; never supply sample user data.
const emptyRecords: readonly RecordView[] = [];
export function getMockRecordData(): readonly RecordView[] {
  return emptyRecords;
}
