import type { ApiError } from "@/lib/api";

export function describeInvitationJoinError(error: ApiError) {
  if (error.status === 409 && error.code === "REQUEST_IN_PROGRESS")
    return {
      title: "참여 요청을 처리하고 있어요",
      body: "잠시 후 다시 참여하기를 눌러 결과를 확인해 주세요.",
    };
  if (error.status === 403)
    return {
      title: "참여 권한을 확인하지 못했어요",
      body: "다시 시도해 주세요. 계속되면 초대해 준 가족에게 새 링크를 요청해 주세요.",
    };
  if (error.kind === "network" || error.kind === "timeout")
    return {
      title: "참여 결과를 확인하지 못했어요",
      body: "연결 상태를 확인한 뒤 다시 참여하기를 눌러 주세요.",
    };
  return {
    title: "참여를 완료하지 못했어요",
    body: "잠시 후 아래 버튼으로 다시 시도해 주세요.",
  };
}
