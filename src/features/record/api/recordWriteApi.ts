import { readApiData } from "@/lib/api/responseData";
import type { CreateRecordRequest, CreatedRecord } from "./recordWriteTypes";
import { isCreatedRecord } from "./recordWriteValidators";

export function createRecord(
  spaceId: string,
  request: CreateRecordRequest,
  signal?: AbortSignal,
): Promise<CreatedRecord> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/source-records`,
    isCreatedRecord,
    { method: "POST", body: request, signal },
  );
}
