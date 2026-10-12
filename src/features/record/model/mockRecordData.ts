import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { RecordView } from "./recordViewTypes";

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(Date.now());
const day = 24 * 60 * 60 * 1000;

// Figma의 예시이며 실제 소식·분석 결과가 아니다. 새 공간은 빈 목록으로 시작한다.
export function getMockRecordData(space: CareSpaceView): readonly RecordView[] {
  if (space.empty) return [];
  const other =
    space.members.find((member) => !member.self) ?? space.members[0];
  const second =
    space.members.find((member) => member.id !== other?.id) ?? other;
  const self = space.members.find((member) => member.self) ?? other;
  const author = (member: typeof other) => ({
    id: member?.id ?? "mock-author",
    name: member?.name ?? "가족",
    self: Boolean(member?.self),
  });
  return [
    {
      id: "mock-record-1",
      spaceId: space.id,
      title: `${space.subjectLabel} 재진 날짜가 바뀌었어요`,
      body: `병원에서 ${space.subjectLabel} 재진 날짜가\n10월 15일에서 20일로 바뀌었대.\n시간은 오전 10시 그대로래.`,
      author: author(other),
      createdAt: Date.parse(`${today}T10:20:00+09:00`),
      analysisStatus: "review",
      proposal: {
        typeLabel: "일정 변경",
        title: "내과 재진",
        beforeLabel: "현재 날짜",
        beforeValue: "10월 15일",
        afterLabel: "제안 날짜",
        afterValue: "10월 20일",
        meta: "2026년 · 오전 10:00 · 예정",
      },
    },
    {
      id: "mock-record-2",
      spaceId: space.id,
      title: `${space.subjectLabel}와 통화했어요`,
      body: `${space.subjectLabel}랑 통화했어. 오늘은 저녁을 잘 드셨고 산책도 다녀오셨대.`,
      author: author(second),
      createdAt: Date.parse(`${today}T19:30:00+09:00`) - day,
      analysisStatus: "no-change",
    },
    {
      id: "mock-record-3",
      spaceId: space.id,
      title: "센터 토요일 이용이 궁금해요",
      body: "센터를 토요일에도 이용할 수 있는지 다음에 물어보려고 해.",
      author: author(self),
      createdAt: Date.parse(`${today}T14:10:00+09:00`) - day * 2,
      analysisStatus: "applied",
    },
  ];
}
