import type { HomeView } from "./homeViewTypes";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";

// 화면 확인용 예시. 실제 일정·건수·담당자 정보가 아니며 API 연결 시 교체한다.
export function getMockHomeData(records: readonly RecordView[]): HomeView {
  return {
    pendingCount: records.filter((record) => record.analysisStatus === "review")
      .length,
    recentNews: records.slice(0, 1).map((record) => ({
      id: record.id,
      title: record.title,
      author: `${record.author.name} · ${formatRecordDate(record.createdAt)}`,
      body: record.body,
      status: record.analysisStatus,
      statusMessage:
        record.analysisStatus === "review"
          ? "변경 제안 1건을 확인해 주세요."
          : undefined,
    })),
    upcomingSchedules: [
      {
        id: "mock-schedule-1",
        title: "내과 재진",
        statusLabel: "예정",
        meta: "10월 15일 (목) · 오전 10:00",
        body: "날짜 변경 제안을 확인 중이에요.",
      },
    ],
    pastScheduleCount: 1,
    tasks: [
      {
        id: "mock-task-1",
        title: "혈압 기록 준비",
        description: "수진 · 미시작",
      },
      {
        id: "mock-task-2",
        title: "재진 동행",
        description: "담당 미정 · 미시작",
      },
    ],
    questions: [
      {
        id: "mock-question-1",
        title: "센터를 토요일에도 이용할 수 있나요?",
        description: "미확인",
      },
    ],
    recentChanges: [
      {
        id: "mock-change-1",
        title: "수진님이 혈압 기록 준비를 맡았어요.",
        description: "오늘 오전 9:00",
      },
    ],
  };
}
