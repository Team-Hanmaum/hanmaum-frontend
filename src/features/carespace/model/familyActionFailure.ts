import { normalizeApiError } from "@/lib/api";
import { canRetryReview } from "@/features/proposal/model/reviewFailure";

export function familyActionFailure(error: unknown) {
  const e = normalizeApiError(error);
  if (e.code === "OWNER_TRANSFER_REQUIRED")
    return "먼저 다른 가족에게 소유권을 이전해 주세요.";
  if (e.code === "SPACE_LABEL_DUPLICATED")
    return "선택한 가족이 같은 이름의 공간을 소유하고 있어요. 다른 가족을 선택하거나 공간 이름을 먼저 확인해 주세요.";
  if (canRetryReview(e))
    return "요청이 처리됐을 수 있어요. 같은 요청으로 결과를 다시 확인해 주세요.";
  if (e.status === 401)
    return "로그인이 만료됐어요. 다시 로그인한 뒤 현재 상태를 확인해 주세요.";
  if (e.status === 403 || e.status === 404)
    return "권한이나 참여 상태가 바뀌었거나 공간이 삭제됐어요. 현재 참여 공간을 확인해 주세요.";
  if (e.status === 409)
    return "공간이나 가족의 참여 상태가 바뀌었어요. 최신 내용을 다시 확인하고 결정해 주세요.";
  if (e.status === 400)
    return e.errors.map((entry) => entry.reason).join(" · ") || e.message;
  return "처리하지 못했어요. 현재 상태를 다시 확인해 주세요.";
}
