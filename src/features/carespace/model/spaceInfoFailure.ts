import { normalizeApiError } from "@/lib/api";
import { canRetryReview } from "@/features/proposal/model/reviewFailure";

export function spaceInfoFailure(error: unknown) {
  const e = normalizeApiError(error);
  if (canRetryReview(e))
    return "요청이 처리됐을 수 있어요. 내용을 바꾸지 않고 같은 요청으로 결과를 다시 확인해 주세요.";
  if (e.code === "SPACE_LABEL_DUPLICATED")
    return "같은 이름의 공간이 있어요. 다른 이름 또는 호칭으로 수정해 주세요.";
  if (e.code === "CHANGE_REQUEST_ALREADY_PENDING")
    return "이미 보낸 공간 정보 수정 요청이 있어요. 요청 목록에서 처리 상태를 확인해 주세요.";
  if (e.status === 401)
    return "로그인이 만료됐어요. 저장하지 않은 내용은 사라지므로 다시 로그인한 뒤 새로 작성해 주세요.";
  if (e.status === 403 || e.status === 404)
    return "현재 역할이나 참여 상태가 바뀌었어요. 공간 정보를 다시 확인해 주세요.";
  if (e.status === 409)
    return "공간 정보나 요청 상태가 바뀌었어요. 최신 내용을 확인하고 다시 결정해 주세요.";
  if (e.status === 400)
    return e.errors.map((entry) => entry.reason).join(" · ") || e.message;
  return "처리하지 못했어요. 잠시 후 다시 확인해 주세요.";
}
