import { careMeta, careValue, emptyCareFields } from "./careItemFields";
import { initialCareStatus } from "./careItemSelectors";
import type {
  CareItemFields,
  CareItemKind,
  CareItemView,
} from "./careItemViewTypes";

// 확정 목록 상태를 확인하는 합성 예시. 승인 대기 제안과 독립된 항목이다.
export function getMockCareItems(
  members: readonly {
    id: string;
    name: string;
    role: string;
    self?: boolean;
  }[],
): CareItemView[] {
  const owner = members.find((member) => member.role === "owner")!;
  const self = members.find((member) => member.self)!;
  const make = (
    id: string,
    kind: CareItemKind,
    fields: Partial<CareItemFields>,
    status = initialCareStatus(kind),
  ): CareItemView => {
    const value = { ...emptyCareFields, ...fields };
    return {
      id,
      kind,
      status,
      title: value.title || value.content,
      fields: value,
      value: careValue(kind, value),
      meta: careMeta(kind, value),
      version: 1,
      evidence: [
        {
          id: `seed-${id}`,
          author: owner.name,
          createdAt: Date.parse("2026-09-29T10:00:00+09:00"),
          directContent: `화면 확인용으로 직접 확인한 내용: ${value.content || value.title}`,
          fields: { ...value },
        },
      ],
    };
  };
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);
  const date = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(nextDate.getDate()).padStart(2, "0")}`;
  const items = [
    make("mock-schedule-next", "schedule", {
      title: "돌봄센터 상담",
      date,
      time: "14:00",
      location: "돌봄센터",
    }),
    make("mock-schedule-past", "schedule", {
      title: "돌봄센터 방문",
      date: "2026-09-26",
      time: "14:00",
    }),
    make(
      "mock-schedule-completed",
      "schedule",
      { title: "기관 상담", date: "2026-09-24", time: "11:00" },
      "completed",
    ),
    make(
      "mock-schedule-cancelled",
      "schedule",
      { title: "방문 상담", date: "2026-09-23", time: "15:00" },
      "cancelled",
    ),
    make("mock-task-2", "task", {
      title: "재진 동행",
      content: "함께 갈 가족을 정해 주세요.",
    }),
    make(
      "mock-task-progress",
      "task",
      {
        title: "상담 내용 정리",
        content: "상담 때 들은 내용을 가족과 정리해 주세요.",
        assigneeId: self.id,
      },
      "in-progress",
    ),
    make(
      "mock-task-completed",
      "task",
      {
        title: "지난 방문 준비",
        content: "방문에 필요한 서류를 준비했어요.",
        assigneeId: owner.id,
      },
      "completed",
    ),
    make(
      "mock-question-confirmed",
      "question",
      {
        title: "센터 일요일 이용?",
        content: "센터를 일요일에도 이용할 수 있나요?",
      },
      "confirmed",
    ),
    make("mock-observation-confirmed", "observation", {
      title: "저녁에 산책했어요",
      content: "저녁 식사 후 가족과 함께 산책했어요.",
      date: "2026-09-27",
    }),
    make("mock-guidance-confirmed", "guidance", {
      title: "센터 방문 시 신분증을 가져오세요",
      content: "첫 방문 때 신분증을 가져오라고 센터에서 안내했어요.",
      date: "2026-09-29",
      location: "돌봄센터",
    }),
  ];
  return items.map((item) => ({
    ...item,
    ...(item.status === "completed"
      ? { statusChangedAt: Date.parse("2026-09-30T13:00:00+09:00") }
      : {}),
    ...(item.status === "confirmed"
      ? {
          answer: {
            content: "센터는 일요일에 운영하지 않아요.",
            confirmedBy: owner.name,
          },
        }
      : {}),
  }));
}
