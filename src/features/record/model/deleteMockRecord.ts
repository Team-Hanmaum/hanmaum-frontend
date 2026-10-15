import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import { mockRecords } from "./mockRecords";

// 동기적으로 연결 사본과 원본을 함께 정리한다. 실제 삭제 트랜잭션은 BE에서 보장한다.
export function deleteMockRecord(space: CareSpaceView, recordId: string) {
  const deletion = mockProposals.removeSource(space, recordId);
  if (!deletion) return null;
  mockRecords.remove(space, recordId);
  return deletion;
}
