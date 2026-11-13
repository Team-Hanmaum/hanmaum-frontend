import { normalizeApiError } from "@/lib/api";

export function shareLinkFailure(error: unknown) {
  const failure = normalizeApiError(error);
  if (failure.status === 401)
    return "로그인이 만료됐어요. 다시 로그인해 주세요.";
  if (failure.status === 403)
    return "공유 권한을 확인하지 못했어요. 현재 참여 상태를 확인한 뒤 다시 시도해 주세요.";
  if (failure.status === 404)
    return "이 항목을 찾을 수 없어요. 돌봄 목록에서 다시 확인해 주세요.";
  if (failure.code === "REQUEST_IN_PROGRESS")
    return "같은 공유 링크를 준비하고 있어요. 잠시 후 같은 요청으로 다시 확인해 주세요.";
  if (failure.status === 409)
    return "항목이나 변경 이력이 바뀌어 공유할 수 없어요. 최신 내용을 다시 확인해 주세요.";
  if (failure.status === 400 || failure.status === 413)
    return "공유할 항목을 확인한 뒤 다시 시도해 주세요.";
  return "공유 링크 발급 결과를 확인하지 못했어요. 같은 요청으로 다시 확인해 주세요.";
}

export function needsShareRefresh(error: unknown) {
  const failure = normalizeApiError(error);
  return failure.status === 409 && failure.code !== "REQUEST_IN_PROGRESS";
}
