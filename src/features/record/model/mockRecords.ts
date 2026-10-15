import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { getMockRecordData } from "./mockRecordData";
import type { RecordAnalysisStatus, RecordView } from "./recordViewTypes";

// 공간별 메모리 Mock. 새로고침 시 초기화하며 세션·서버·스토리지에 저장하지 않는다.
let snapshot: Record<string, readonly RecordView[]> = {};
const listeners = new Set<() => void>();
function publish(spaceId: string, records: readonly RecordView[]) {
  snapshot = { ...snapshot, [spaceId]: records };
  listeners.forEach((listener) => listener());
}

export const mockRecords = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getForSpace(space: CareSpaceView): readonly RecordView[] {
    if (!isMockPreviewEnabled) return [];
    return snapshot[space.id] ?? getMockRecordData(space);
  },
  retain(space: CareSpaceView) {
    // 참여자 변경으로 합성 원본의 작성자·내용이 다시 생성되지 않게 보존한다.
    if (isMockPreviewEnabled && !snapshot[space.id])
      publish(space.id, mockRecords.getForSpace(space));
  },
  create(space: CareSpaceView, body: string) {
    const self = space.members.find((member) => member.self);
    if (!isMockPreviewEnabled || !self || !body.trim()) return null;
    const record: RecordView = {
      id: `mock-record-${crypto.randomUUID()}`,
      spaceId: space.id,
      // 요약/제목 생성 API 전의 표시용 문구. 사용자 원문은 가공하지 않는다.
      title: "새로 남긴 소식",
      body,
      author: { id: self.id, name: self.name, self: true },
      createdAt: Date.now(),
      analysisStatus: "analyzing",
    };
    publish(space.id, [record, ...mockRecords.getForSpace(space)]);
    return record;
  },
  remove(space: CareSpaceView, recordId: string) {
    if (!isMockPreviewEnabled) return false;
    const records = mockRecords.getForSpace(space);
    const record = records.find((entry) => entry.id === recordId);
    const self = space.members.find(
      (member) => member.self && member.role === space.role,
    );
    if (
      !self ||
      !record ||
      (space.role !== "owner" && record.author.id !== self.id)
    )
      return false;
    publish(
      space.id,
      records.filter((entry) => entry.id !== recordId),
    );
    return true;
  },
  setAnalysisStatus(
    space: CareSpaceView,
    recordId: string,
    status: RecordAnalysisStatus,
  ) {
    if (!isMockPreviewEnabled) return;
    const records = mockRecords.getForSpace(space);
    // 입력 내용을 분석하거나 실제 제안을 만들지 않는다.
    const record = records.find((item) => item.id === recordId);
    if (!record || (status === "review" && !record.proposal)) return;
    publish(
      space.id,
      records.map((item) =>
        item.id === recordId ? { ...item, analysisStatus: status } : item,
      ),
    );
  },
};
