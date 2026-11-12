import { normalizeApiError } from "@/lib/api";
export function reviewFailure(error: unknown) {
  const e = normalizeApiError(error);
  if (e.status === 401)
    return "로그인이 만료됐어요. 다시 로그인한 뒤 최신 내용을 확인해 주세요.";
  if (e.status === 403 || e.status === 404)
    return "권한이 바뀌었거나 삭제된 내용이에요. 목록으로 돌아가 확인해 주세요.";
  if (e.code === "ITEM_LOCKED")
    return "다른 가족이 이 항목을 확인하고 있어요. 잠시 후 다시 확인해 주세요.";
  if (e.code === "EDIT_LOCK_EXPIRED")
    return "편집 확인 시간이 만료됐어요. 최신 내용을 다시 확인해 주세요.";
  if (e.status === 409)
    return e.code === "REQUEST_IN_PROGRESS"
      ? "같은 요청을 처리 중이에요. 잠시 후 결과를 확인하거나 같은 요청으로 다시 시도해 주세요."
      : "제안·대상·요청 상태가 바뀌었어요. 목록에서 최신 내용을 다시 검토해 주세요.";
  if (e.status === 400)
    return e.errors.map((x) => x.reason).join(" · ") || e.message;
  if (error instanceof Error && e.kind === "unknown") return error.message;
  return "처리 결과를 확인하지 못했어요. 같은 요청으로 다시 확인하거나 목록에서 결과를 확인해 주세요.";
}
export function canRetryReview(error: unknown) {
  const e = normalizeApiError(error);
  return (
    ["network", "timeout", "invalid-response"].includes(e.kind) ||
    (e.status ?? 0) >= 500 ||
    e.code === "REQUEST_IN_PROGRESS"
  );
}
