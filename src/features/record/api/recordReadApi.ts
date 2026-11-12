import { readApiData } from "@/lib/api/responseData";
import type {
  RecordDetail,
  RecordListQuery,
  RecordListResponse,
} from "./recordReadTypes";
import { isRecordDetail, isRecordList } from "./recordReadValidators";

const recordsPath = (spaceId: string) =>
  `/api/spaces/${encodeURIComponent(spaceId)}/source-records` as const;

export function getRecentRecords(
  spaceId: string,
  size: number,
  signal?: AbortSignal,
): Promise<RecordListResponse> {
  return readApiData(recordsPath(spaceId), isRecordList, {
    params: { size },
    signal,
  });
}

// 첫 조회는 cursor를 생략하고 이후에는 응답의 nextCursor를 그대로 전달한다.
export function getRecordPage(
  spaceId: string,
  { cursor, size }: RecordListQuery,
  signal?: AbortSignal,
): Promise<RecordListResponse> {
  return readApiData(recordsPath(spaceId), isRecordList, {
    params: cursor ? { cursor, size } : { size },
    signal,
  });
}

export function getRecordDetail(
  spaceId: string,
  recordId: string,
  signal?: AbortSignal,
): Promise<RecordDetail> {
  return readApiData(
    `${recordsPath(spaceId)}/${encodeURIComponent(recordId)}`,
    (value): value is RecordDetail =>
      isRecordDetail(value) &&
      value.spaceId === spaceId &&
      value.recordId === recordId,
    { signal },
  );
}
