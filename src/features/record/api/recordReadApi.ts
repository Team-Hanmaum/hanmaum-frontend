import { readApiData } from "@/lib/api/responseData";
import type { RecordListResponse } from "./recordReadTypes";
import { isRecordList } from "./recordReadValidators";

export function getRecentRecords(
  spaceId: string,
  size: number,
  signal?: AbortSignal,
): Promise<RecordListResponse> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/source-records`,
    isRecordList,
    { params: { size }, signal },
  );
}
