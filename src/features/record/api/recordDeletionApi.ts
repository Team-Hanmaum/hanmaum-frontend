import { readApiData } from "@/lib/api/responseData";
import type {
  DeleteRecordBody,
  DeletedRecord,
  RecordDeletionImpact,
} from "./recordDeletionTypes";
import {
  isDeletedRecord,
  isRecordDeletionImpact,
} from "./recordDeletionValidators";
const path = (space: string, record: string) =>
  `/api/spaces/${encodeURIComponent(space)}/source-records/${encodeURIComponent(record)}` as const;
export function getRecordDeletionImpact(
  space: string,
  record: string,
  signal?: AbortSignal,
) {
  return readApiData(
    `${path(space, record)}/deletion-impact`,
    (value): value is RecordDeletionImpact =>
      isRecordDeletionImpact(value) && value.recordId === record,
    { signal },
  );
}
export function deleteRecord(
  space: string,
  record: string,
  body: DeleteRecordBody,
) {
  return readApiData(
    `${path(space, record)}/deletions`,
    (value): value is DeletedRecord =>
      isDeletedRecord(value) && value.recordId === record,
    { method: "POST", body },
  );
}
