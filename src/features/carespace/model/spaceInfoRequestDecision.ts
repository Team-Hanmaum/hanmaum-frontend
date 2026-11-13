import type { SpaceDetail } from "../api/spaceDetailTypes";
import type {
  ChangeRequestDetail,
  ChangeRequestEntry,
} from "@/features/proposal/api/changeRequestTypes";
import type {
  RequestApplicationBody,
  RequestCancellationBody,
  RequestDecisionBody,
} from "@/features/proposal/api/proposalWriteTypes";

export type SpaceInfoDecisionMode = "apply" | "decline" | "cancel";
export type SpaceInfoRequestAttempt =
  | { mode: "apply"; body: RequestApplicationBody }
  | { mode: "decline"; body: RequestDecisionBody }
  | { mode: "cancel"; body: RequestCancellationBody };

export function spaceInfoDecisionError(
  mode: SpaceInfoDecisionMode,
  entry: ChangeRequestEntry,
  request: ChangeRequestDetail,
  space: SpaceDetail,
) {
  if (entry.action !== "UPDATE_SPACE" || entry.status !== "PENDING")
    return "이미 처리되었거나 공간 정보 수정 요청이 아니에요. 최신 상태를 확인해 주세요.";
  if (mode === "cancel")
    return request.submittedBy.membershipId === space.membershipId
      ? null
      : "직접 보낸 요청만 취소할 수 있어요.";
  if (space.role !== "OWNER") return "현재 소유자만 최종 처리할 수 있어요.";
  if (!entry.reviewToken)
    return "요청 상태가 바뀌었어요. 최신 내용을 다시 확인해 주세요.";
  if (mode === "decline") return null;
  if (
    entry.redactedFields.length ||
    typeof entry.requestedValues?.subjectLabel !== "string"
  )
    return "요청 내용을 확인할 수 없어 반영할 수 없어요.";
  if (
    !entry.expectedSpaceVersion ||
    entry.expectedSpaceVersion !== entry.currentSpaceVersion ||
    entry.expectedSpaceVersion !== space.version
  )
    return "요청 이후 공간 정보가 바뀌었어요. 현재 정보를 확인한 뒤 새 요청을 작성해 주세요.";
  return null;
}

// 확인한 원래 버전을 그대로 전송한다. 최신 버전으로 치환해 오래된 요청을 승인하지 않는다.
export function spaceInfoRequestAttempt(
  mode: SpaceInfoDecisionMode,
  entry: ChangeRequestEntry,
): SpaceInfoRequestAttempt {
  const clientRequestId = crypto.randomUUID();
  const requestEntryId = entry.requestEntryId;
  if (mode === "cancel")
    return { mode, body: { clientRequestId, entries: [{ requestEntryId }] } };
  if (!entry.reviewToken)
    throw new Error("최신 요청 내용을 다시 확인해 주세요.");
  if (mode === "decline")
    return {
      mode,
      body: {
        clientRequestId,
        entries: [{ requestEntryId, reviewToken: entry.reviewToken }],
      },
    };
  if (!entry.expectedSpaceVersion)
    throw new Error("요청한 공간 버전을 확인할 수 없어요.");
  return {
    mode,
    body: {
      clientRequestId,
      entries: [
        {
          requestEntryId,
          reviewToken: entry.reviewToken,
          expectedSpaceVersion: entry.expectedSpaceVersion,
        },
      ],
    },
  };
}
