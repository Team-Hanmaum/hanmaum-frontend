import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockAction } from "@/lib/useMockAction";
import { mockRecords } from "./mockRecords";

// 재시도는 기존 소식의 표시 상태만 변경한다. 원문 재등록·AI 호출·자동 반영은 없다.
export function useMockRecordAnalysis(
  space: CareSpaceView,
  recordId: string,
  onRetried: () => void,
) {
  const { pending, run } = useMockAction();
  return {
    pending,
    retry() {
      run(() => {
        mockRecords.setAnalysisStatus(space, recordId, "analyzing");
        onRetried();
      });
    },
  };
}
