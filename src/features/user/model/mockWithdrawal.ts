import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import { mockRecords } from "@/features/record/model/mockRecords";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { mockAccount } from "./mockAccount";

export function withdrawMockAccount() {
  if (!isMockPreviewEnabled)
    throw new Error("Mock 모드에서만 확인할 수 있어요.");
  const account = mockAccount.getSnapshot();
  if (account.status === "withdrawn") return;
  if (account.status !== "active" && account.status !== "withdrawal-unknown")
    throw new Error("계정 상태를 다시 확인해 주세요.");
  const spaces = mockCareSpaces.getSnapshot().spaces;
  if (spaces.some((space) => space.role === "owner"))
    throw new Error(
      "소유 중인 모든 공간의 소유권 이전 또는 삭제를 먼저 완료해 주세요.",
    );
  // 공유 데이터는 삭제하지 않는다. 탈퇴자의 업무·대기 요청 처리 정책은 별도 확정 대상.
  for (const space of spaces) {
    mockRecords.retain(space);
    mockProposals.getForSpace(space);
  }
  mockCareSpaces.endAccountParticipation();
  mockAccount.setStatus("withdrawn");
}
