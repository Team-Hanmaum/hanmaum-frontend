import { readApiData } from "@/lib/api/responseData";
import type {
  UpdateSpaceInfoBody,
  UpdateSpaceInfoResult,
} from "./spaceInfoTypes";
import { isUpdateSpaceInfoResult } from "./spaceInfoValidators";

export function updateSpaceInfo(
  spaceId: string,
  body: UpdateSpaceInfoBody,
): Promise<UpdateSpaceInfoResult> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}`,
    (value): value is UpdateSpaceInfoResult =>
      isUpdateSpaceInfoResult(value) && value.spaceId === spaceId,
    { method: "PATCH", body },
  );
}
