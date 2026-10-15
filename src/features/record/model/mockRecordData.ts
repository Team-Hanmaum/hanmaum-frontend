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
    ...[
      [
        "mock-record-type-0",
        "센터 이용이 궁금해요",
        "토요일에도 센터를 이용할 수 있는지 궁금해.",
      ],
      [
        "mock-record-type-1",
        "오늘 점심 식사",
        `${space.subjectLabel} 점심을 평소의 절반 정도 드셨어. 식사 후 거실에서 쉬셨어.`,
      ],
      [
        "mock-record-type-2",
        "센터에서 안내문을 보내준대요",
        "센터에서 월요일에 이용 안내문 보내준대.",
      ],
      [
        "mock-record-link",
        "예약된 날짜를 다시 확인했어요",
        "10월 15일 오전 10시에 내과 예약되어 있는 거 맞대.",
      ],
    ].map(([id, title, body], index): RecordView => ({
      id,
      title,
      body,
      spaceId: space.id,
      author: author(self),
      createdAt: Date.parse(`${today}T09:00:00+09:00`) - day * (4 + index),
      analysisStatus: "review",
    })),
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
      id: "mock-record-batch",
      spaceId: space.id,
      title: "정형외과 재진과 준비할 기록을 확인했어요",
      body: "정형외과 재진은 10월 16일에서 21일로 바뀌었대. 오후 2시는 그대로야.\n혈압 기록도 최근 3일 대신 일주일치를 준비하래.",
      author: author(other),
      createdAt: Date.parse(`${today}T10:00:00+09:00`) - day * 3,
      analysisStatus: "review",
    },
    {
      id: "mock-record-request",
      spaceId: space.id,
      title: "재진 준비물을 확인했어요",
      body: "재진 때 진료 의뢰서와 함께 복용약 목록도 가져오래.",
      author: author(other),
      createdAt: Date.parse("2026-09-30T10:20:00+09:00"),
      analysisStatus: "review",
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
