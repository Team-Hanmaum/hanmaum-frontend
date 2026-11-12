import { readApiData } from "@/lib/api/responseData";
import {
  isChangeRequestPage,
  isChangeRequestDetail,
} from "./changeRequestValidators";
import type { ChangeRequestDetail, RequestStatus } from "./changeRequestTypes";
const base = (spaceId: string) =>
  `/api/spaces/${encodeURIComponent(spaceId)}/change-requests` as const;
export function getChangeRequests(
  spaceId: string,
  status: RequestStatus,
  cursor?: string | null,
  signal?: AbortSignal,
) {
  return readApiData(base(spaceId), isChangeRequestPage, {
    params: { status, size: 20, ...(cursor && { cursor }) },
    signal,
  });
}
export function getChangeRequest(
  spaceId: string,
  requestId: string,
  signal?: AbortSignal,
) {
  return readApiData(
    `${base(spaceId)}/${encodeURIComponent(requestId)}`,
    (v): v is ChangeRequestDetail =>
      isChangeRequestDetail(v) && v.requestId === requestId,
    { signal },
  );
}
